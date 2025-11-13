// services/bookingService.js
const { now } = require('sequelize/lib/utils');
const db = require('../models');
const { Op } = require('sequelize');

const Booking = db.Booking;
const Schedules = db.Schedules;
const Histories = db.Histories;
const sequelize = db.sequelize;

/**
 * create a pending booking
 */
const createBookingServices = async ({ user_id, coach_id, slot_start, note }) => {
    const booking = await Booking.create({ user_id, coach_id, slot_start, note, status: 'pending' });
    // create history
    await Histories.create({ user_id, coach_id, booking_id: booking.booking_id, action: 'create_booking', note: `Created booking ${booking.booking_id}` });
    return booking;
};

const getMyBookingsForWeek = async (userId, weekStartISO) => {
    // 1. Kiểm tra tham số
    if (!userId || !weekStartISO) {
        throw new Error('Thiếu thông tin userId hoặc ngày bắt đầu tuần');
    }

    // 2. Tính toán ngày (logic nghiệp vụ)
    const startDate = new Date(weekStartISO);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // Lấy 7 ngày

    // 3. Tương tác với Database
    const bookings = await Booking.findAll({
        where: {
            user_id: userId,
            slot_start: {
                [Op.gte]: startDate, // Lớn hơn hoặc bằng
                [Op.lt]: endDate      // Nhỏ hơn
            }
        },
        include: [
            {
                model: db.Users,
                as: 'coach', //  association : 'coach'
                attributes: ['id', 'fullname', 'email', 'phonenumber'] // Lấy Tên/Email/SĐT coach
            }
        ],
        order: [['slot_start', 'ASC']] // Sắp xếp theo ngày
    });
    const processBooking = bookings.map(booking => {
        const bookingData = booking.toJSON();
        //logic handle auto cancel booking request after start
        const now = new Date();
        if (bookingData.status === 'pending' && new Date(bookingData.slot_start) < now) {
            bookingData.status = 'cancelled';
        }
        return bookingData;
    })
    // 4. Trả về dữ liệu thô
    return processBooking;
};

/**
 * confirm a booking:
 * - create a schedule entry for coach at slot_start (unique constraint ensures coach not double-booked)
 * - set booking.status = 'confirmed'
 * returns confirmed booking
 */
const confirmBookingServices = async (booking_id, confirmerUserId) => {
    return sequelize.transaction(async (t) => {
        const booking = await Booking.findByPk(booking_id, { transaction: t });
        if (!booking) throw { status: 404, message: 'Booking not found' };
        if (booking.status !== 'pending') throw { status: 400, message: 'Only pending bookings can be confirmed' };

        // check schedule conflict for that coach at slot_start
        const conflict = await Schedules.findOne({
            where: { coach_id: booking.coach_id, slot_start: booking.slot_start },
            transaction: t
        });
        if (conflict) throw { status: 409, message: 'Coach already has a schedule at that time' };

        // create schedule
        await Schedules.create({
            slot_start: booking.slot_start,
            user_id: booking.user_id,
            coach_id: booking.coach_id,
            status: 'confirmed'
        }, { transaction: t });

        booking.status = 'confirmed';
        booking.updated_at = new Date();
        await booking.save({ transaction: t });

        await Histories.create({
            user_id: booking.user_id,
            coach_id: booking.coach_id,
            booking_id: booking.booking_id,
            action: 'confirm_booking',
            note: `Booking ${booking.booking_id} confirmed by user ${confirmerUserId}`
        }, { transaction: t });

        return booking;
    });
};

const cancelBookingServices = async (booking_id, cancelledBy) => {
    const booking = await Booking.findByPk(booking_id);
    if (!booking) throw { status: 404, message: 'Booking not found' };

    booking.status = 'cancelled';
    booking.updated_at = new Date();
    await booking.save();

    await Histories.create({
        user_id: booking.user_id,
        coach_id: booking.coach_id,
        booking_id: booking.booking_id,
        action: 'cancel_booking',
        note: `Cancelled by ${cancelledBy}`
    });

    // optionally remove schedule if existed
    await Schedules.destroy({ where: { coach_id: booking.coach_id, slot_start: booking.slot_start } });

    return booking;
};

const getScheduleForCoach = async (coachId, weekStartISO) => {
    const startDate = new Date(weekStartISO);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // Lấy 7 ngày

    const bookings = await db.Booking.findAll({
        where: {
            coach_id: coachId,
            slot_start: {
                [Op.between]: [startDate, endDate]
            },
            // Chỉ lấy các lịch CHƯA HOÀN THÀNH (để giảm tải)
            status: {
                [Op.notIn]: ['completed', 'expired']
            }
        },
        // Quan trọng: Lấy thông tin User (người đặt)
        include: [{
            model: db.Users,
            as: 'user', // Đảm bảo 'as' này khớp với association của bạn
            attributes: ['fullname', 'phonenumber']
        }],
        order: [['slot_start', 'ASC']]
    });

    const processBooking = bookings.map(booking => {
        const bookingData = booking.toJSON();
        //logic handle auto cancel booking request after start
        const now = new Date();
        if (bookingData.status === 'pending' && new Date(bookingData.slot_start) < now) {
            bookingData.status = 'cancelled';
        }
        return bookingData;
    })
    // 4. Trả về dữ liệu thô
    return processBooking;
};

const confirmAndCancelOthers = async (coachId, bookingIdToConfirm) => {
    // Bắt đầu một transaction
    const t = await sequelize.transaction();

    try {
        // Bước 1: Tìm booking được chọn
        const bookingToConfirm = await Booking.findOne({
            where: { booking_id: bookingIdToConfirm }
        }, { transaction: t });

        // Bước 2: Kiểm tra quyền và logic
        if (!bookingToConfirm) {
            throw { status: 404, message: "Không tìm thấy lịch đặt này." };
        }
        if (bookingToConfirm.coach_id !== coachId) {
            throw { status: 403, message: "Bạn không có quyền xác nhận lịch này." };
        }
        if (bookingToConfirm.status !== 'pending') {
            throw { status: 400, message: "Lịch này đã được xử lý, không thể xác nhận." };
        }

        // Bước 3: Cập nhật booking này thành 'confirmed'
        await bookingToConfirm.update({ status: 'confirmed' }, { transaction: t });

        // Bước 4: Tự động HUỶ (cancel) tất cả các booking 'pending' KHÁC
        // TRÙNG GIỜ (slot_start) và TRÙNG COACH (coach_id)
        await Booking.update(
            { status: 'cancelled' }, // Dữ liệu cần update
            {
                where: {
                    coach_id: coachId,
                    slot_start: bookingToConfirm.slot_start,
                    status: 'pending',
                    // Quan trọng: [Op.ne] = Not Equal (Không phải chính nó)
                    booking_id: {
                        [Op.ne]: bookingIdToConfirm
                    }
                },
                transaction: t
            }
        );

        // Bước 5: Nếu mọi thứ OK, commit transaction
        await t.commit();

        return { message: "Xác nhận thành công! Các lịch chờ khác đã bị huỷ." };

    } catch (err) {
        // Bước 6: Nếu có lỗi, rollback tất cả
        await t.rollback();
        console.error("Lỗi Transaction khi confirm:", err);
        throw err; // Ném lỗi ra để controller bắt
    }
};

const listBookingsForCoach = async (coach_id) => {
    return Booking.findAll({ where: { coach_id }, order: [['slot_start', 'ASC']] });
};

const getCoachList = async (opts = {}) => {
    const { upcoming = true, from, to } = opts;
    const now = new Date();

    // build booking where clause
    const bookingWhere = {};
    if (upcoming) {
        bookingWhere.slot_start = { [Op.gte]: now };
    }
    if (from) {
        bookingWhere.slot_start = bookingWhere.slot_start || {};
        bookingWhere.slot_start[Op.gte] = new Date(from);
    }
    if (to) {
        bookingWhere.slot_start = bookingWhere.slot_start || {};
        bookingWhere.slot_start[Op.lte] = new Date(to);
    }

    // find coaches with includes; bookings include is optional (may be empty)
    const coaches = await db.Users.findAll({
        where: { role: 'coach' },
        attributes: ['id', 'fullname', 'email', 'phonenumber', 'role'],
        include: [
            {
                model: db.UserDetails,
                as: 'detail',
                attributes: ['address', 'gender', 'specialty_id', 'has_confirmed_booking', 'user_id', 'createdAt'],
                include: [
                    {
                        model: db.Specialty,
                        as: 'specialty',
                        attributes: ['specialty_id', 'name', 'description', 'image']
                    }
                ]
            },
            {
                model: Booking,
                as: 'bookings',
                required: false, // allow coaches without bookings
                where: Object.keys(bookingWhere).length ? bookingWhere : undefined,
                attributes: ['booking_id', 'user_id', 'coach_id', 'slot_start', 'status', 'note', 'created_at'],
                order: [['slot_start', 'ASC']]
            }
        ],
        order: [['fullname', 'ASC']]
    });

    // map to add aggregates: bookingCount and nextBooking (earliest upcoming slot)
    const result = coaches.map(coach => {
        const c = coach.toJSON();
        const bookings = c.bookings || [];
        // sort bookings by slot_start ascending just in case
        bookings.sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start));
        const bookingCount = bookings.length;
        const nextBooking = bookingCount > 0 ? bookings[0] : null;
        return {
            id: c.id,
            fullname: c.fullname,
            email: c.email,
            phonenumber: c.phonenumber,
            role: c.role,
            detail: c.detail || null,
            bookings,
            bookingCount,
            nextBooking
        };
    });

    return result;
};

const cancelPendingBooking = async (bookingId, userId) => {
    // Bước 1: Tìm booking VÀ người đang huỷ (để biết role)
    // (Chúng ta cần biết 'role' của người đang bấm nút huỷ)
    const [booking, canceller] = await Promise.all([
        db.Booking.findByPk(bookingId),
        db.Users.findByPk(userId)
    ]);

    // Bước 2: Kiểm tra
    if (!booking) {
        throw new Error('Không tìm thấy lịch đặt này (ID: ' + bookingId + ')');
    }
    if (!canceller) {
        throw new Error('Không tìm thấy người dùng (ID: ' + userId + ')');
    }

    // Bước 3: KIỂM TRA BẢO MẬT (Rất quan trọng!)
    // Người huỷ có phải là User đặt lịch không?
    const isTheUser = (booking.user_id === canceller.id);
    // Người huỷ có phải là Coach của lịch này không?
    const isTheCoach = (booking.coach_id === canceller.id && canceller.role === 'coach');

    if (!isTheUser && !isTheCoach) {
        // Người này không liên quan
        throw new Error('Bạn không có quyền huỷ lịch này');
    }

    // Bước 4: KIỂM TRA LOGIC NGHIỆP VỤ (Theo yêu cầu của bạn)
    if (isTheUser) {
        // User (người đặt) chỉ được huỷ khi 'pending'
        if (booking.status !== 'pending') {
            throw new Error('Không thể huỷ. Lịch đã được Coach xác nhận. Vui lòng liên hệ Coach.');
        }
    } else if (isTheCoach) {
        // Coach (người dạy) có thể huỷ 'pending' hoặc 'confirmed'
        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
            throw new Error('Không thể huỷ. Lịch này đã hoàn thành hoặc đã bị huỷ trước đó.');
        }
    }

    // Bước 5: HÀNH ĐỘNG (Dùng logic "cập nhật" thay vì "xoá")
    const originalStatus = booking.status; // Lưu lại status cũ
    booking.status = 'cancelled';
    booking.updated_at = new Date();
    await booking.save();

    // Bước 6: Tạo History (Ghi lại lịch sử)
    await db.Histories.create({
        user_id: booking.user_id,
        coach_id: booking.coach_id,
        booking_id: booking.booking_id,
        action: 'cancel_booking',
        note: `Cancelled by ${canceller.role} (ID: ${canceller.id})`
    });

    // Bước 7: Nếu huỷ một lịch đã 'confirmed', phải "giải phóng" slot
    if (originalStatus === 'confirmed') {
        // Xoá lịch này khỏi bảng Schedules để coach có thể nhận lịch khác
        await db.Schedules.destroy({ where: { coach_id: booking.coach_id, slot_start: booking.slot_start } });
    }

    return booking; // Trả về booking đã được cập nhật
};

module.exports = {
    createBookingServices,
    confirmBookingServices,
    cancelBookingServices,
    getScheduleForCoach,
    confirmAndCancelOthers,
    listBookingsForCoach,
    getCoachList,
    getMyBookingsForWeek,
    cancelPendingBooking
};
