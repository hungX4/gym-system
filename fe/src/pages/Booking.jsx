import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, Snackbar,
    CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// --- Giữ nguyên các hàm Helpers ---
const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const API_BASE = 'http://localhost:8001'; // <-- Giả định API base

function startOfWeek(date) {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
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
    return d.toISOString(); // "2025-11-10T17:00:00.000Z" (ví dụ)
}
// --- Hết Helpers ---

// +++ HÀM MỚI: Helper lấy màu sắc theo Status +++
// (Bạn tự định nghĩa màu cho chuẩn)
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


export default function Booking() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

    // --- STATE MỚI: Dữ liệu từ API ---
    // Giữ cấu trúc object (map) để truy cập O(1)
    const [bookings, setBookings] = useState({}); // { "slot_id": { ...bookingData } }
    const [loading, setLoading] = useState(false);

    // --- STATE MỚI: Cho Dialog Chi Tiết ---
    const [selectedSlot, setSelectedSlot] = useState(null); // null | { booking_id: 123, ... } | { isNew: true, slot_start: '...' }

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

    // --- LOGIC MỚI: Fetch data từ API khi tuần thay đổi ---
    const fetchBookingsForWeek = useCallback(async (start_date) => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken'); // Lấy token
        if (!token) {
            setLoading(false);
            setSnack({ open: true, message: 'Vui lòng đăng nhập', severity: 'error' });
            return;
        }

        try {
            // API của bạn cần hỗ trợ query theo tuần
            // Ví dụ: /bookings/my_bookings?week_start=...
            const res = await fetch(`${API_BASE}/bookings/my_bookings?week_start=${start_date.toISOString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Không thể tải lịch');

            const data = await res.json(); // Giả sử trả về mảng [ { booking_id: 1, slot_start: '...', status: 'pending', ... }, ... ]

            // *** Rất quan trọng: Chuyển mảng (Array) thành Map (Object) để render ***
            const bookingsMap = data.reduce((acc, booking) => {
                // Chúng ta dùng slot_start làm key
                // Giả định slot_start luôn là giờ chuẩn (ví dụ: 18:00:00, không phải 18:01)
                const slotId = new Date(booking.slot_start).toISOString();
                acc[slotId] = booking;
                return acc;
            }, {});

            setBookings(bookingsMap);

        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []); // không có dependency, vì chúng ta gọi nó thủ công

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

    // --- LOGIC MỚI: Mở Dialog chi tiết ---
    function handleCellClick(dayDate, hour) {
        const id = makeSlotId(dayDate, hour);
        const existingBooking = bookings[id];

        if (existingBooking) {
            // Đã có lịch -> Mở dialog để xem/huỷ
            setSelectedSlot(existingBooking);
        } else {
            // Ô trống -> Mở dialog để tạo mới
            // (Chúng ta có thể kiểm tra nếu là quá khứ thì không cho)
            if (new Date(id) < new Date()) {
                setSnack({ open: true, message: 'Không thể đặt lịch cho quá khứ', severity: 'warning' });
                return;
            }
            setSelectedSlot({
                isNew: true,
                slot_start: id, // ISOString
                // Bạn có thể cần truyền coach_id vào đây nếu trang này dành cho 1 coach cụ thể
                // coach_id: ...   
                coach_id: coachIdFromQuery
            });
        }
    }

    // Hàm này sẽ được Dialog chi tiết gọi
    const handleCloseDialog = (refresh = false) => {
        setSelectedSlot(null);
        if (refresh) {
            // Nếu có hành động (tạo/huỷ), fetch lại data của tuần
            fetchBookingsForWeek(weekStart);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* --- Phần Header (Tuần/Nút) --- (Giữ nguyên) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Lịch đặt của tôi</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={prevWeek} size="large" title="Tuần trước" disabled={loading}>
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <Paper sx={{ px: 2, py: 1 }} elevation={1}>
                        <Typography variant="subtitle1">
                            Tuần: <strong>{formatDateShort(weekStart)}</strong> — <strong>{formatDateShort(addDays(weekStart, 6))}</strong>
                        </Typography>
                    </Paper>
                    <IconButton onClick={nextWeek} size="large" title="Tuần sau" disabled={loading}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* --- Hiển thị Loading --- */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

            <TableContainer component={Paper} sx={{ overflowX: 'auto', opacity: loading ? 0.5 : 1 }}>
                <Table stickyHeader>
                    {/* --- TableHead (Thứ/Ngày) --- (Giữ nguyên) */}
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 80, backgroundColor: 'background.paper' }}>Giờ</TableCell>
                            {weekDays.map((d, idx) => {
                                const isToday = d.toDateString() === new Date().toDateString();
                                return (
                                    <TableCell
                                        key={d.toISOString()}
                                        align="center"
                                        sx={{ minWidth: 140, backgroundColor: isToday ? 'rgba(25,118,210,0.06)' : 'inherit' }}
                                    >
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
                                    // Tìm data booking cho slot này
                                    const bookingData = bookings[id];
                                    // Lấy style dựa trên status
                                    const style = getStatusStyle(bookingData?.status);
                                    const isPast = new Date(id) < new Date();

                                    return (
                                        <TableCell key={id} align="center" sx={{ p: 0 }}>
                                            <Button
                                                fullWidth
                                                onClick={() => handleCellClick(d, hour)}
                                                sx={{
                                                    height: 56, borderRadius: 0,
                                                    textTransform: 'none',
                                                    color: style.color || 'inherit',
                                                    bgcolor: style.bgcolor || 'transparent',
                                                    opacity: isPast && !bookingData ? 0.4 : 1, // Mờ đi nếu là quá khứ và trống
                                                    '&:hover': {
                                                        bgcolor: style.bgcolor ? style.bgcolor : 'action.hover',
                                                        filter: 'brightness(90%)'
                                                    },
                                                }}
                                            >
                                                {/* Hiển thị label (Chờ, Đã xác nhận...) thay vì "Trống" */}
                                                {bookingData ? style.label : 'Trống'}
                                            </Button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- DIALOG MỚI: Hiển thị/Tạo chi tiết Booking --- */}
            {selectedSlot && (
                <BookingDetailDialog
                    slotData={selectedSlot}
                    open={!!selectedSlot}
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


// --- COMPONENT MỚI: Dialog Chi Tiết Booking ---
// (Bạn có thể tách ra file riêng nếu muốn)

function BookingDetailDialog({ open, onClose, slotData, setSnack }) {
    // slotData là { isNew: true, ... } hoặc là { booking_id: 123, status: 'pending', ... }
    const [note, setNote] = useState(() => slotData.note || '');
    const [loading, setLoading] = useState(false);
    const coachIdFromQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('coachId'); // Sẽ lấy '2' từ '?coachId=2'
    }, [location.search]);
    const isNew = slotData.isNew;
    const { label: statusLabel, color: statusColor } = getStatusStyle(slotData.status);
    const slotTime = new Date(slotData.slot_start);

    // Xử lý tạo mới (giống CoachDialog)
    const handleCreate = async () => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        try {
            //coach_id lấy từ url
            const coach_id_TODO = coachIdFromQuery; // <--- TODO: SỬA LẠI CHỖ NÀY

            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    coach_id: coach_id_TODO,
                    slot_start: slotData.slot_start, // ISOString
                    note: note
                })
            });
            if (!res.ok) throw new Error('Đặt lịch thất bại');

            setSnack({ open: true, message: 'Đặt lịch thành công, chờ xác nhận', severity: 'success' });
            onClose(true); // Đóng và refresh
        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý huỷ
    const handleCancel = async () => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');

        try {
            // api delete
            const res = await fetch(`${API_BASE}/bookings/${slotData.booking_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Không cần 'Content-Type' hay 'body'
                }
            });

            // Lấy text để đọc lỗi (nếu có)
            const text = await res.text();
            let data = text ? JSON.parse(text) : {};

            if (!res.ok) {
                // Nếu server trả lỗi 4xx, 5xx, nó sẽ vào đây
                throw new Error(data.message || 'Huỷ lịch thất bại');
            }

            setSnack({ open: true, message: 'Đã huỷ lịch', severity: 'info' });

            // BƯỚC QUAN TRỌNG NHẤT:
            // onClose(true) sẽ kích hoạt 'refresh' ở component cha
            onClose(true);

        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ... (phần render của Dialog)
    // Đảm bảo nút "Huỷ lịch" gọi đúng hàm này
    /*
    <Button onClick={handleCancel} color="error" disabled={loading}>
        {loading ? 'Đang huỷ...' : 'Huỷ lịch'}
    </Button>
    */

    return (
        <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="xs">
            <DialogTitle>
                {isNew ? 'Đặt lịch tập mới' : 'Chi tiết lịch tập'}
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6">
                    Giờ: {`${slotTime.getHours()}:00, ${DAY_NAMES[(slotTime.getDay() + 6) % 7]}, ${formatDateShort(slotTime)}`}
                </Typography>

                {!isNew && (
                    <Box sx={{ my: 2 }}>
                        <Typography variant="body1" component="span">
                            Trạng thái: <Chip label={statusLabel} sx={{ bgcolor: statusColor, color: 'white' }} size="small" />
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Coach: {slotData.coach?.fullname || 'Chưa rõ'}
                        </Typography>
                    </Box>
                )}

                <TextField
                    label="Ghi chú"
                    multiline
                    rows={3}
                    fullWidth
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    margin="normal"
                    // Chỉ cho sửa nếu là lịch mới, hoặc lịch pending
                    disabled={loading || (!isNew && slotData.status !== 'pending')}
                />

                {/* Nếu là lịch đã confirm, chỉ hiển thị note */}
                {!isNew && slotData.status !== 'pending' && (
                    <Typography variant="caption" color="text.secondary">
                        Lịch đã {statusLabel} không thể sửa ghi chú.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => onClose(false)} color="inherit">Đóng</Button>

                {/* Nút Huỷ (Chỉ hiển thị khi là 'pending' hoặc 'confirmed') */}
                {!isNew && (slotData.status === 'pending' || slotData.status === 'confirmed') && (
                    <Button onClick={handleCancel} color="error" disabled={loading}>
                        {loading ? 'Đang huỷ...' : 'Huỷ lịch'}
                    </Button>
                )}

                {/* Nút Đặt (Chỉ hiển thị khi là lịch mới) */}
                {isNew && (
                    <Button onClick={handleCreate} variant="contained" disabled={loading}>
                        {loading ? 'Đang đặt...' : 'Xác nhận đặt'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}