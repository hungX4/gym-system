import { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { startOfWeek, addDays, API_BASE, makeSlotId } from '../utils/bookingHelper';

export default function useBooking() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [bookings, setBookings] = useState({}); // { "slot_id": { ...bookingData } }
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

    //Đọc coachId từ URL Query ---
    const location = useLocation();
    const coachIdFromQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('coachId'); // Sẽ lấy '2' từ '?coachId=2'
    }, [location.search]);

    const hours = useMemo(() => Array.from({ length: 15 }, (_, i) => 6 + i), []); // 6..20
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    // --- LOGIC: Fetch data từ API khi tuần thay đổi ---
    const fetchBookingsForWeek = useCallback(async (start_date) => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            setSnack({ open: true, message: 'Vui lòng đăng nhập', severity: 'error' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/bookings/my_bookings?week_start=${start_date.toISOString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Không thể tải lịch');

            const data = await res.json();
            const now = new Date(); // Lấy giờ hiện tại

            // *** Chuyển mảng (Array) thành Map (Object) + Dọn dẹp Status ***
            const bookingsMap = data.reduce((acc, booking) => {
                const slotId = new Date(booking.slot_start).toISOString();

                // --- Logic dọn dẹp (giống bên Coach) ---
                const slotTime = new Date(booking.slot_start);
                let effectiveStatus = booking.status;

                if (booking.status === 'pending' && slotTime < now) {
                    effectiveStatus = 'expired';
                }
                if (booking.status === 'confirmed' && slotTime < now) {
                    effectiveStatus = 'completed';
                }
                // ---

                acc[slotId] = { ...booking, status: effectiveStatus }; // Gán status đã "sạch"
                return acc;
            }, {});

            setBookings(bookingsMap);

        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []); // dependency rỗng, chỉ gọi thủ công

    // useEffect để gọi fetch khi weekStart thay đổi
    useEffect(() => {
        fetchBookingsForWeek(weekStart);
    }, [weekStart, fetchBookingsForWeek]);


    function prevWeek() {
        setWeekStart((w) => addDays(w, -7));
    }
    function nextWeek() {
        setWeekStart((w) => addDays(w, 7));
    }

    // --- LOGIC: Mở Dialog chi tiết ---
    function handleCellClick(dayDate, hour) {
        const id = makeSlotId(dayDate, hour);
        const existingBooking = bookings[id];

        if (existingBooking) {
            // Đã có lịch -> Mở dialog để xem/huỷ
            setSelectedSlot(existingBooking);
        } else {
            // Ô trống -> Mở dialog để tạo mới
            if (new Date(id) < new Date()) {
                setSnack({ open: true, message: 'Không thể đặt lịch cho quá khứ', severity: 'warning' });
                return;
            }
            setSelectedSlot({
                isNew: true,
                slot_start: id, // ISOString
                coach_id: coachIdFromQuery // "Nhét" coachId từ URL vào
            });
        }
    }

    // Hàm này sẽ được Dialog chi tiết gọi
    const handleCloseDialog = (refresh = false) => {
        setSelectedSlot(null);
        if (refresh) {
            fetchBookingsForWeek(weekStart);
        }
    };

    // Trả về mọi thứ component cần
    return {
        loading,
        weekStart,
        weekDays,
        hours,
        bookings,
        selectedSlot,
        snack,
        setSnack,
        prevWeek,
        nextWeek,
        handleCellClick,
        handleCloseDialog
    };
}