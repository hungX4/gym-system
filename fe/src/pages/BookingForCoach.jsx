import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, Snackbar,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Các hàm Helpers (Giống Booking.jsx) ---
const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const API_BASE = 'http://localhost:8001';

function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}

function getStatusStyle(status) {
    switch (status) {
        case 'pending': // Chưa xác nhận
            return { bgcolor: 'warning.light', color: 'warning.contrastText', label: 'Chờ' };
        case 'confirmed': // Đã xác nhận
            return { bgcolor: 'success.light', color: 'success.contrastText', label: 'Đã xác nhận' };
        case 'completed': // Đã tập
            return { bgcolor: 'info.light', color: 'info.contrastText', label: 'Hoàn thành' };
        case 'cancelled': // Bị huỷ (bởi coach hoặc user)
        case 'expired': // Hết hạn (quá giờ)
            return { bgcolor: 'error.light', color: 'error.contrastText', label: 'Đã huỷ' };
        default: // Trống
            return { bgcolor: 'transparent', label: 'Trống' };
    }
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function formatDateShort(d) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
}
function makeSlotId(date, hour) {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString(); // "2025-11-10T17:00:00.000Z"
}
// --- Hết Helpers ---

// +++ HELPER MỚI: Tóm tắt slot cho Coach +++
function getSlotSummary(bookings) {
    if (!bookings || bookings.length === 0) {
        return { total: 0, pending: 0, confirmed: 0, label: 'Trống', style: {} };
    }

    let pending = 0;
    let confirmed = 0;

    bookings.forEach(b => {
        if (b.status === 'pending') pending++;
        if (b.status === 'confirmed') confirmed++;
    });

    if (confirmed > 0) {
        return {
            total: bookings.length, pending, confirmed,
            label: `1 Đã xác nhận`,
            style: { bgcolor: 'success.main', color: 'success.contrastText' }
        };
    }
    if (pending > 0) {
        return {
            total: bookings.length, pending, confirmed,
            label: `${pending} đang chờ`,
            style: { bgcolor: 'warning.light', color: 'warning.contrastText' }
        };
    }

    // Mặc định (ví dụ: toàn bộ đã huỷ)
    return { total: bookings.length, pending, confirmed, label: `${bookings.length} đã huỷ`, style: { opacity: 0.6 } };
}


// +++ COMPONENT CHÍNH: Bảng lịch cho Coach +++
export default function BookingForCoach() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

    // CẤU TRÚC STATE KHÁC:
    // { "slot_id": [ booking1, booking2, ... ] }
    const [bookingsBySlot, setBookingsBySlot] = useState({});
    const [loading, setLoading] = useState(false);

    // State cho Dialog: Sẽ giữ { slot_start: "...", bookings: [...] }
    const [selectedSlotData, setSelectedSlotData] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

    const hours = useMemo(() => Array.from({ length: 15 }, (_, i) => 6 + i), []); // 6..20
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    // --- LOGIC FETCH MỚI: Lấy lịch của Coach ---
    const fetchBookingsForWeek = useCallback(async (start_date) => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            setSnack({ open: true, message: 'Vui lòng đăng nhập', severity: 'error' });
            return;
        }

        try {
            // API MỚI: Lấy lịch của coach, không phải của user
            const res = await fetch(`${API_BASE}/bookings/bookingforcoach?week_start=${start_date.toISOString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Không thể tải lịch của coach');

            const data = await res.json(); // [ booking1, booking2, ... ]

            // *** Rất quan trọng: GOM NHÓM (GROUPING) lại theo slot_id ***
            const bookingsMap = data.reduce((acc, booking) => {
                const slotId = new Date(booking.slot_start).toISOString();
                // Nếu key (slotId) chưa tồn tại, tạo 1 mảng rỗng
                if (!acc[slotId]) {
                    acc[slotId] = [];
                }
                // Push booking này vào mảng của slot đó
                acc[slotId].push(booking);
                return acc;
            }, {}); // return { "slot_id": [ booking1, ... ] }

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

    // --- LOGIC CLICK MỚI ---
    function handleCellClick(dayDate, hour) {
        const id = makeSlotId(dayDate, hour);
        const bookingsForSlot = bookingsBySlot[id]; // Lấy mảng bookings

        if (bookingsForSlot && bookingsForSlot.length > 0) {
            // Đã có lịch -> Mở dialog để xem/xác nhận
            setSelectedSlotData({
                slot_start: id,
                bookings: bookingsForSlot
            });
        } else {
            // Ô trống -> Không làm gì
            setSnack({ open: true, message: 'Không có lịch nào trong ô này', severity: 'info' });
            return;
        }
    }

    // Hàm này sẽ được Dialog chi tiết gọi
    const handleCloseDialog = (refresh = false) => {
        setSelectedSlotData(null);
        if (refresh) {
            // Nếu có hành động (xác nhận/huỷ), fetch lại data
            fetchBookingsForWeek(weekStart);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* --- Phần Header (Tuần/Nút) --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Lịch dạy của Coach</Typography>
                {/* ... (Các nút chuyển tuần giữ nguyên) ... */}
            </Box>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

            <TableContainer component={Paper} sx={{ overflowX: 'auto', opacity: loading ? 0.5 : 1 }}>
                <Table stickyHeader>
                    {/* --- TableHead (Thứ/Ngày) --- */}
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 80, backgroundColor: 'background.paper' }}>Giờ</TableCell>
                            {weekDays.map((d, idx) => {
                                // ... (Render các cột ngày)
                                return (
                                    <TableCell key={d.toISOString()} align="center" /* ... */ >
                                        <Typography variant="subtitle2">{DAY_NAMES[idx]}</Typography>
                                        <Typography variant="caption">{formatDateShort(d)}</Typography>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>

                    {/* --- TableBody (Các Slot) --- (ĐÃ THAY ĐỔI) */}
                    <TableBody>
                        {hours.map((hour) => (
                            <TableRow key={hour}>
                                <TableCell sx={{ fontWeight: '600' }}>{`${hour}:00`}</TableCell>

                                {weekDays.map((d) => {
                                    const id = makeSlotId(d, hour);
                                    // Lấy mảng bookings cho slot này
                                    const bookingsForSlot = bookingsBySlot[id];
                                    // Lấy tóm tắt (label và style)
                                    const summary = getSlotSummary(bookingsForSlot);
                                    const isPast = new Date(id) < new Date();

                                    return (
                                        <TableCell key={id} align="center" sx={{ p: 0 }}>
                                            <Button
                                                fullWidth
                                                onClick={() => handleCellClick(d, hour)}
                                                disabled={!bookingsForSlot || bookingsForSlot.length === 0} // Disable nếu ô trống
                                                sx={{
                                                    height: 56, borderRadius: 0,
                                                    textTransform: 'none',
                                                    color: summary.style.color || 'inherit',
                                                    bgcolor: summary.style.bgcolor || 'transparent',
                                                    opacity: isPast && !bookingsForSlot ? 0.4 : 1,
                                                    '&:hover': {
                                                        bgcolor: summary.style.bgcolor ? summary.style.bgcolor : 'action.hover',
                                                        filter: 'brightness(90%)'
                                                    },
                                                }}
                                            >
                                                {/* Hiển thị tóm tắt */}
                                                {summary.label}
                                            </Button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- DIALOG MỚI: Dành cho Coach --- */}
            {selectedSlotData && (
                <BookingDetailForCoachDialog
                    slotData={selectedSlotData}
                    open={!!selectedSlotData}
                    onClose={handleCloseDialog}
                    setSnack={setSnack}
                />
            )}

            <Snackbar
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                message={snack.message}
                autoHideDuration={2000}
            />
        </Box>
    );
}


// +++ COMPONENT MỚI: Dialog Chi Tiết Lịch cho Coach +++
// (Nằm riêng, hoặc chung file)

function BookingDetailForCoachDialog({ open, onClose, slotData, setSnack }) {
    // slotData là { slot_start: "...", bookings: [ booking1, booking2, ... ] }
    const [loading, setLoading] = useState(false);
    const slotTime = new Date(slotData.slot_start);

    // Kiểm tra xem đã có lịch nào 'confirmed' trong slot này chưa
    const hasConfirmedBooking = slotData.bookings.some(b => b.status === 'confirmed');

    // --- LOGIC QUAN TRỌNG: Xác nhận 1, huỷ các lịch còn lại ---
    const handleConfirm = async (bookingIdToConfirm) => {
        if (!window.confirm('Bạn có chắc muốn CHẤP NHẬN lịch này? Các lịch chờ khác trong cùng giờ sẽ tự động bị huỷ.')) {
            return;
        }

        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        try {
            // API MỚI: Endpoint này phải được tạo ở backend
            // Backend sẽ tự động:
            // 1. Đổi booking_id này -> 'confirmed'
            // 2. Đổi TẤT CẢ booking 'pending' khác (cùng slot_start, cùng coach_id) -> 'cancelled'
            const res = await fetch(`${API_BASE}/bookings/confirmBooking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: bookingIdToConfirm
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Xác nhận thất bại');

            setSnack({ open: true, message: 'Đã xác nhận thành công!', severity: 'success' });
            onClose(true); // Đóng và refresh
        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Huỷ 1 lịch (giống user)
    const handleCancel = async (bookingIdToCancel) => {
        if (!window.confirm('Bạn có chắc muốn HUỶ lịch của user này?')) {
            return;
        }
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_BASE}/bookings/${bookingIdToCancel}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Huỷ lịch thất bại');

            setSnack({ open: true, message: 'Đã huỷ lịch', severity: 'info' });
            onClose(true); // Đóng và refresh
        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
            <DialogTitle>
                Chi tiết Slot: {`${slotTime.getHours()}:00, ${DAY_NAMES[(slotTime.getDay() + 6) % 7]}, ${formatDateShort(slotTime)}`}
            </DialogTitle>
            <DialogContent dividers>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {slotData.bookings.map((booking, index) => {
                        const style = getStatusStyle(booking.status);
                        console.log(booking.status);
                        // Kiểm tra xem nút Confirm có nên bị vô hiệu hoá không
                        // Bị vô hiệu hoá NẾU:
                        // 1. Đã có 1 lịch khác được confirmed
                        // 2. Lịch này không phải là 'pending'
                        const isConfirmDisabled = loading || (hasConfirmedBooking && booking.status !== 'confirmed');
                        // Nút huỷ bị vô hiệu hoá nếu đã xong/huỷ
                        const isCancelDisabled = loading || ['completed', 'cancelled', 'expired'].includes(booking.status);

                        return (
                            <React.Fragment key={booking.booking_id}>
                                <ListItem alignItems="flex-start" sx={{ opacity: loading ? 0.5 : 1 }}>
                                    <ListItemAvatar>
                                        <Avatar>{booking.user?.fullname?.charAt(0) || 'U'}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography component="span" variant="body1" sx={{ fontWeight: 600 }}>
                                                    {booking.user?.fullname || 'User ẩn'}
                                                </Typography>
                                                <Chip label={style.label} sx={{ bgcolor: style.bgcolor, color: style.color }} size="small" />
                                            </Box>
                                        }
                                        secondary={
                                            <Box component="span" sx={{ mt: 1 }}>
                                                <Typography component="span" variant="body2" color="text.primary" display="block">
                                                    SĐT: {booking.user?.phonenumber || 'Chưa rõ'}
                                                </Typography>
                                                <Typography component="span" variant="body2" color="text.secondary" display="block">
                                                    Ghi chú: {booking.note || '(không có)'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', px: 2, pb: 1, opacity: loading ? 0.5 : 1 }}>
                                    {booking.status === 'pending' && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleConfirm(booking.booking_id)}
                                            disabled={isConfirmDisabled} // Vô hiệu hoá nếu đã có lịch khác confirmed
                                        >
                                            Chấp nhận
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleCancel(booking.booking_id)}
                                        disabled={isCancelDisabled} // Vô hiệu hoá nếu đã huỷ
                                    >
                                        Huỷ lịch
                                    </Button>
                                </Box>
                                {index < slotData.bookings.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        );
                    })}
                </List>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => onClose(false)} color="inherit" disabled={loading}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
}
