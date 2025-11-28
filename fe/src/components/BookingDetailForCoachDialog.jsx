import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Chip, CircularProgress,
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Import Helpers ---
import { API_BASE, DAY_NAMES, formatDateShort, getStatusStyle } from '../utils/bookingHelper';


export default function BookingDetailForCoachDialog({ open, onClose, slotData, setSnack }) {
    // slotData là { slot_start: "...", bookings: [ booking1, ... ] }
    const [loading, setLoading] = useState(false);
    const slotTime = new Date(slotData.slot_start);
    const now = new Date(); // Lấy giờ hiện tại

    // (Data đã được "dọn dẹp" từ hook cha, nên 'status' đã đúng)
    const hasConfirmedBooking = slotData.bookings.some(b => b.status === 'confirmed');

    // --- LOGIC QUAN TRỌNG: Xác nhận 1, huỷ các lịch còn lại ---
    const handleConfirm = async (bookingIdToConfirm) => {
        if (!window.confirm('Bạn có chắc muốn CHẤP NHẬN lịch này? Các lịch chờ khác trong cùng giờ sẽ tự động bị huỷ.')) {
            return;
        }

        setLoading(true);
        const token = window.localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_BASE}/bookings/confirm`, {
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

    // Huỷ 1 lịch
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
                        // (Data đã "sạch" từ hook, 'booking.status' đã đúng)
                        const style = getStatusStyle(booking.status);

                        const isConfirmDisabled = loading || (hasConfirmedBooking && booking.status !== 'confirmed') || (booking.status !== 'pending');
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
                                            disabled={isConfirmDisabled}
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
                                        disabled={isCancelDisabled}
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