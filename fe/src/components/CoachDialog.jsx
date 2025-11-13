// src/components/CoachDialog.jsx
import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Box, Avatar, Button, Grid, TextField, Snackbar, Alert, CircularProgress
} from '@mui/material';
import AuthDialog from './AuthDialog'; // <<< 1. IMPORT AUTHDIALOG

const API_BASE = 'http://localhost:8001';

export default function CoachDialog({ open, onClose, coachId, coachSummary, onGoToBooking }) {
    const [detail, setDetail] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [submitLoading, setSubmitLoading] = React.useState(false);
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    // booking form
    const [slotStart, setSlotStart] = React.useState('');
    const [note, setNote] = React.useState('');

    // --- 2. THÊM STATE CHO AUTH ---
    const [openAuth, setOpenAuth] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(
        !!localStorage.getItem('accessToken')
    );
    // ---

    React.useEffect(() => {
        if (!open) return;
        let mounted = true;
        setLoading(true);
        const token = window.localStorage.getItem('accessToken');

        // Reset form khi mở dialog
        setSlotStart('');
        setNote('');

        // Cập nhật trạng thái đăng nhập mỗi khi mở
        setIsLoggedIn(!!localStorage.getItem('accessToken'));

        fetch(`${API_BASE}/users/profile/${coachId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(async res => {
                const text = await res.text();
                let data = null;
                try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
                if (!res.ok) throw new Error((data && (data.message || data.raw)) || `Lỗi ${res.status}`);
                return data;
            })
            .then(data => {
                if (!mounted) return;
                setDetail(data);
            })
            .catch(err => {
                console.error(err);
                setSnack({ open: true, severity: 'error', message: err.message || 'Lỗi lấy thông tin' });
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, [open, coachId]); // Thêm 'open' làm dependency để reset

    const handleCreateBooking = async () => {
        // --- 3. THÊM "GÁC CỔNG" AUTH ---
        if (!isLoggedIn) {
            setOpenAuth(true); // Mở dialog đăng nhập nếu chưa login
            return;
        }
        // ---

        if (!slotStart) {
            setSnack({ open: true, severity: 'error', message: 'Chọn ngày giờ trước khi đặt' });
            return;
        }
        setSubmitLoading(true);
        const token = window.localStorage.getItem('accessToken');

        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    coach_id: coachId,
                    slot_start: new Date(slotStart).toISOString(),
                    note
                })
            });

            const text = await res.text();
            let data = null;
            try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

            if (!res.ok) {
                const msg = (data && (data.message || (Array.isArray(data.errors) ? data.errors.join(', ') : data.raw))) || `Lỗi (${res.status})`;
                setSnack({ open: true, severity: 'error', message: msg });
                return;
            }

            setSnack({ open: true, severity: 'success', message: 'Đặt lịch thành công' });
            // optional: redirect to user's bookings page
            onGoToBooking?.(coachId); // Nút này đã có auth ở component cha
            onClose?.();
        } catch (err) {
            console.error(err);
            setSnack({ open: true, severity: 'error', message: 'Lỗi kết nối' });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <>
            <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Thông tin Huấn luyện viên</DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : (
                        <>
                            {/* ... (Phần thông tin coach giữ nguyên) ... */}
                            <Grid container spacing={2}>
                                {/* ... (Grid item Avatar) ... */}
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 96, height: 96 }}>{(coachSummary?.fullname || 'C').charAt(0)}</Avatar>
                                        <Typography variant="subtitle1">{coachSummary?.fullname}</Typography>
                                        <Typography variant="caption" color="text.secondary">{coachSummary?.phonenumber}</Typography>
                                    </Box>
                                </Grid>

                                {/* ... (Grid item thông tin) ... */}
                                <Grid item xs={12} sm={8}>
                                    <Typography variant="subtitle2">Thông tin cơ bản</Typography>
                                    <Typography variant="body2">Email: {coachSummary?.email || '—'}</Typography>
                                    <Typography variant="body2">Role: {coachSummary?.role}</Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2">Chi tiết</Typography>
                                        <Typography variant="body2">Địa chỉ: {detail?.detail?.address || 'Chưa có'}</Typography>
                                        <Typography variant="body2">Giới tính: {detail?.detail?.gender || 'Chưa có'}</Typography>
                                        <Typography variant="body2">Đã confirm booking: {detail?.detail?.has_confirmed_booking ? 'Có' : 'Chưa'}</Typography>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2">Chuyên môn</Typography>
                                        <Typography variant="body2">{detail?.detail?.specialty?.name || 'Chưa có chuyên môn'}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {detail?.detail?.specialty?.description || ''}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, borderTop: '1px dashed #eee', pt: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Đặt lịch nhanh</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Chọn ngày & giờ )" // <<< SỬA LABEL
                                            type="datetime-local"
                                            fullWidth
                                            value={slotStart}
                                            onChange={(e) => setSlotStart(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            // --- 4. THÊM STEP ĐỂ BỎ PHÚT ---
                                            // 3600 giây = 60 phút * 60 giây = 1 giờ
                                            inputProps={{ step: 3600 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ghi chú (tùy chọn)"
                                            fullWidth
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ display: 'flex', gap: 1 }}>
                                        <Button variant="contained" onClick={handleCreateBooking} disabled={submitLoading}>
                                            {submitLoading ? 'Đang gửi...' : 'Đặt lịch'}
                                        </Button>
                                        {/* Nút này đã có auth từ component cha (onGoToBooking) */}
                                        <Button variant="outlined" onClick={() => onGoToBooking?.(coachId)}>Trang đặt lịch của coach</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* --- 5. RENDER AUTHDIALOG --- */}
            <AuthDialog
                open={openAuth}
                onClose={() => setOpenAuth(false)}
                onLoginSuccess={() => {
                    setOpenAuth(false);
                    setIsLoggedIn(true);
                    // Báo cho user biết để họ nhấn lại
                    setSnack({
                        open: true,
                        severity: 'success',
                        message: 'Đăng nhập thành công! Vui lòng nhấn "Đặt lịch" lại.'
                    });
                }}
            />

            <Snackbar
                open={snack.open}
                autoHideDuration={4000} // Tăng thời gian lên 1 chút
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </>
    );
}