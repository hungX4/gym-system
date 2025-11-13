// controllers/bookingController.js
const {
    createBookingServices,
    confirmBookingServices,
    cancelBookingServices,
    listBookingsForUser,
    listBookingsForCoach,
    getCoachList,
    getMyBookingsForWeek,
    cancelPendingBooking
} = require('../services/bookingServices');

const coachList = async (req, res) => {
    try {
        // parse query params
        const upcomingParam = req.query.upcoming;
        const upcoming = upcomingParam === undefined ? true : (String(upcomingParam).toLowerCase() !== 'false');
        const from = req.query.from;
        const to = req.query.to;

        const list = await getCoachList({ upcoming, from, to });
        res.json(list);
    } catch (err) {
        console.error('coachList error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const createBooking = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { coach_id, slot_start, note } = req.body;
        if (!coach_id || !slot_start) return res.status(400).json({ message: 'coach_id and slot_start required' });
        const booking = await createBookingServices({ user_id, coach_id, slot_start, note });
        res.status(201).json(booking);
        console.log(req.body);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

const getCreateBooking = async (req, res) => {
    try {
        // 1. Lấy thông tin từ request
        // (Middleware 'isAuthenticated' đã chạy và gán 'req.user')
        const userId = req.user.id;
        const { week_start } = req.query; // Lấy từ ?week_start=...

        // 2. Gọi Service để xử lý
        const bookings = await getMyBookingsForWeek(userId, week_start);

        // 3. Trả về kết quả thành công (200)
        res.status(200).json(bookings);

    } catch (error) {
        // 4. Xử lý lỗi (bất cứ lỗi nào từ Service)
        console.error("Lỗi từ getMyBookings Controller:", error);
        res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
    }
};



const confirmBooking = async (req, res) => {
    try {
        const booking_id = req.params.id;
        // you might want to check req.user.role === 'coach' or 'admin' in production
        const booking = await confirmBookingServices(booking_id, req.user.id);
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

// const cancelBooking = async (req, res) => {
//     try {
//         const booking_id = req.params.id;
//         const booking = await cancelBookingServices(booking_id, req.user.id);
//         res.json(booking);
//     } catch (err) {
//         console.error(err);
//         res.status(err.status || 500).json({ message: err.message || 'Server error' });
//     }
// };

const myBookings = async (req, res) => {
    try {
        const user_id = req.user.id;
        const bookings = await listBookingsForUser(user_id);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const coachBookings = async (req, res) => {
    try {
        const coach_id = req.user.id;
        const bookings = await listBookingsForCoach(coach_id);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        // 1. Lấy Booking ID từ URL (ví dụ: /bookings/123)
        const { id: bookingId } = req.params;

        // 2. Lấy User ID từ token (đã được middleware 'isAuthenticated' gán vào)
        const userId = req.user.id;

        // 3. Gọi Service để xử lý "nghiệp vụ nặng"
        // 'userId' rất quan trọng để bảo mật, đảm bảo user A không thể xoá của user B
        await cancelPendingBooking(bookingId, userId);

        // 4. Trả về thành công
        // 200 OK (với message) hoặc 204 No Content (không có message) đều được
        res.status(200).json({ message: 'Đã huỷ lịch thành công' });

    } catch (error) {
        console.error("Lỗi từ cancelBooking Controller:", error);

        // Phân loại lỗi để trả về response chính xác
        if (error.message.includes('quyền')) {
            return res.status(403).json({ message: error.message }); // 403 Forbidden
        }
        if (error.message.includes('Không thể huỷ')) {
            return res.status(422).json({ message: error.message }); // 422 Unprocessable Entity
        }
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }

        // Lỗi chung
        res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
    }
};
module.exports = {
    createBooking,
    confirmBooking,
    cancelBooking,
    myBookings,
    coachBookings,
    coachList,
    getCreateBooking,
    cancelBooking
};
