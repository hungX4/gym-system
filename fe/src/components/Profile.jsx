import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, CircularProgress, Snackbar,
    Alert, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';

// <<< 1. IMPORT HOOK MỚI >>>
import useProfile from '../hooks/useProfile';

export default function ProfileDialog({ open, onClose, onLogout }) {

    // <<< 2. GỌI HOOK ĐỂ LẤY LOGIC >>>
    const {
        profile,
        newPassword,
        setNewPassword,
        specialties,
        loading,
        submitLoading,
        snack,
        setSnack,
        handleChange,
        handleUpdateProfile,
        handleLogout
    } = useProfile(open, onClose); // Truyền 'open' và 'onClose' vào

    // Component này giờ chỉ còn làm 1 việc: RENDER
    return (
        <>
            <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
                <DialogTitle>Thông tin cá nhân</DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box component="form" sx={{ display: 'grid', gap: 2, mt: 1 }}>
                            <TextField
                                label="Họ và tên"
                                name="fullname"
                                value={profile.fullname ?? ''} // <<< LỖI ĐÃ SỬA
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={profile.email ?? ''} // <<< LỖI ĐÃ SỬA
                                fullWidth
                                disabled
                            />
                            <TextField
                                label="Số điện thoại"
                                name="phonenumber"
                                value={profile.phonenumber ?? ''} // <<< LỖI ĐÃ SỬA
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Địa chỉ"
                                name="address"
                                value={profile.address ?? ''} // <<< LỖI ĐÃ SỬA
                                onChange={handleChange}
                                fullWidth
                                placeholder="Ví dụ: 123 Đường ABC, Q1, TPHCM"
                            />
                            <FormControl fullWidth>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    label="Giới tính"
                                    name="gender"
                                    value={profile.gender ?? ''} // <<< LỖI ĐÃ SỬA
                                    onChange={handleChange}
                                >
                                    <MenuItem value=""><em>(Không chọn)</em></MenuItem>
                                    <MenuItem value="male">Nam</MenuItem>
                                    <MenuItem value="female">Nữ</MenuItem>
                                    <MenuItem value="other">Khác</MenuItem>
                                </Select>
                            </FormControl>

                            {profile.role === 'coach' && (
                                <FormControl fullWidth>
                                    <InputLabel>Chuyên môn</InputLabel>
                                    <Select
                                        label="Chuyên môn"
                                        name="specialty_id"
                                        value={profile.specialty_id ?? ''} // <<< LỖI ĐÃ SỬA
                                        onChange={handleChange}
                                    >
                                        <MenuItem value=""><em>(Chưa có)</em></MenuItem>
                                        {specialties.map(spec => (
                                            <MenuItem key={spec.specialty_id} value={spec.specialty_id}>
                                                {spec.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                label="Mật khẩu mới (bỏ trống nếu không đổi)"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button color="error" onClick={() => handleLogout(onLogout)} disabled={submitLoading}>
                        Đăng xuất
                    </Button>
                    <Box>
                        <Button onClick={onClose} disabled={submitLoading}>Đóng</Button>
                        <Button
                            variant="contained"
                            onClick={handleUpdateProfile}
                            disabled={loading || submitLoading}
                        >
                            {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Lưu'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Thông báo */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
}