import { useMemo, useState, useEffect, useCallback } from 'react';
import { startOfWeek, addDays, API_BASE, makeSlotId } from '../utils/bookingHelper';

export default function useCoachSchedule() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [bookingsBySlot, setBookingsBySlot] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedSlotData, setSelectedSlotData] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

    const hours = useMemo(() => Array.from({ length: 15 }, (_, i) => 6 + i), []); // 6..20
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    // --- LOGIC FETCH: Lấy lịch của Coach ---
    const fetchBookingsForWeek = useCallback(async (start_date) => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            setSnack({ open: true, message: 'Vui lòng đăng nhập', severity: 'error' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/bookings/bookingforcoach?week_start=${start_date.toISOString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Không thể tải lịch của coach');

            const data = await res.json(); // [ booking1, booking2, ... ]
            const now = new Date();

            // *** GOM NHÓM (GROUPING) và "DỌN DẸP" STATUS ***
            const bookingsMap = data.reduce((acc, booking) => {
                const slotId = new Date(booking.slot_start).toISOString();

                const slotTime = new Date(booking.slot_start);
                let effectiveStatus = booking.status;

                if (booking.status === 'pending' && slotTime < now) {
                    effectiveStatus = 'expired';
                }
                if (booking.status === 'confirmed' && slotTime < now) {
                    effectiveStatus = 'completed';
                }

                const cleanedBooking = { ...booking, status: effectiveStatus };

                if (!acc[slotId]) {
                    acc[slotId] = [];
                }
                acc[slotId].push(cleanedBooking);
                return acc;
            }, {});

            setBookingsBySlot(bookingsMap);

        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

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

    // --- LOGIC CLICK ---
    function handleCellClick(dayDate, hour) {
        const id = makeSlotId(dayDate, hour);
        const bookingsForSlot = bookingsBySlot[id]; // Lấy mảng bookings

        if (bookingsForSlot && bookingsForSlot.length > 0) {
            setSelectedSlotData({
                slot_start: id,
                bookings: bookingsForSlot
            });
        } else {
            setSnack({ open: true, message: 'Không có lịch nào trong ô này', severity: 'info' });
            return;
        }
    }

    // Hàm này sẽ được Dialog chi tiết gọi
    const handleCloseDialog = (refresh = false) => {
        setSelectedSlotData(null);
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
        bookingsBySlot,
        selectedSlotData,
        snack,
        setSnack,
        prevWeek,
        nextWeek,
        handleCellClick,
        handleCloseDialog
    };
}