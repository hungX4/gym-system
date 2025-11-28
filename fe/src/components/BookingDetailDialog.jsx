import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Chip, TextField,
    CircularProgress
} from '@mui/material';

// --- Import Helpers ---
import { API_BASE, DAY_NAMES, formatDateShort, getStatusStyle } from '../utils/bookingHelper';


export default function BookingDetailDialog({ open, onClose, slotData, setSnack }) {
    // slotData là { isNew: true, coach_id: '2', ... } 
    // hoặc { booking_id: 123, status: 'pending', ... }
    const [note, setNote] = useState(() => slotData.note || '');
    const [loading, setLoading] = useState(false);

    const isNew = slotData.isNew;
    // (Status đã được "dọn dẹp" ở hook cha)
    const { label: statusLabel, color: statusColor } = getStatusStyle(slotData.status);
    const slotTime = new Date(slotData.slot_start);

    // Xử lý tạo mới
    const handleCreate = async () => {
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');

        // Đọc coach_id mà 'handleCellClick' đã truyền vào
        const coachIdToSubmit = slotData.coach_id;

        try {
            // Kiểm tra an toàn
            if (!coachIdToSubmit) {
                throw new Error('Lỗi Frontend: Không tìm thấy "coach_id". URL có bị sai không?');
            }

            const dataToSend = {
                coach_id: coachIdToSubmit,
                slot_start: slotData.slot_start, // ISOString
                note: note
            };

            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Đặt lịch thất bại');
            }

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
            const res = await fetch(`${API_BASE}/bookings/${slotData.booking_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // (Xử lý lỗi chi tiết hơn)
            const text = await res.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (e) { }

            if (!res.ok) {
                throw new Error(data.message || 'Huỷ lịch thất bại');
            }

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
                {/* Sửa: 'completed' và 'expired' cũng không thể huỷ */}
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