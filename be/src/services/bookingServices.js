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

const listBookingsForUser = async (user_id) => {
    return Booking.findAll({ where: { user_id }, order: [['slot_start', 'ASC']] });
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
    // Bước 1: Tìm booking đó trong database
    const booking = await db.Booking.findByPk(bookingId);

    // Bước 2: Kiểm tra xem booking có tồn tại không
    if (!booking) {
        throw new Error('Không tìm thấy lịch đặt này (ID: ' + bookingId + ')');
    }

    // Bước 3: KIỂM TRA BẢO MẬT (Rất quan trọng!)
    // User này có phải là chủ của booking không?
    if (booking.user_id !== userId) {
        // Hoặc user này là coach? (Tùy logic của bạn, nhưng ở đây ta chỉ cho user)
        throw new Error('Bạn không có quyền huỷ lịch này');
    }

    // Bước 4: KIỂM TRA LOGIC NGHIỆP VỤ (Theo yêu cầu của bạn)
    // Coach đã xác nhận chưa?
    if (booking.status !== 'pending') {
        // Nếu status là 'confirmed', 'completed', 'cancelled' -> không cho xoá
        // Bạn có thể muốn một logic khác cho 'confirmed' (ví dụ: 'yêu cầu huỷ')
        // Nhưng theo yêu cầu, ta chỉ xoá nếu 'pending'.
        throw new Error('Không thể huỷ. Lịch này đã được Coach xác nhận hoặc đã qua.');
    }

    // Bước 5: HÀNH ĐỘNG (Xoá)
    // Vượt qua hết các bài kiểm tra -> Xoá record khỏi database
    await booking.destroy();

    // Không cần trả về gì, vì controller sẽ tự xử lý
    return;
};

module.exports = {
    createBookingServices,
    confirmBookingServices,
    cancelBookingServices,
    listBookingsForUser,
    listBookingsForCoach,
    getCoachList,
    getMyBookingsForWeek,
    cancelPendingBooking
};
