import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProfileDialog({ open, onClose, onLogout }) {
    const [profile, setProfile] = React.useState({
        fullname: '',
        email: '',
        phonenumber: '',
        password: '',
    });
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (open) {
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) return;
                    const res = await fetch('http://localhost:8001/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error('Failed to fetch profile');
                    const data = await res.json();
                    setProfile({
                        fullname: data.fullname || '',
                        email: data.email || '',
                        phonenumber: data.phonenumber || '',
                        password: '', // password không trả từ server
                    });
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [open]);

    // 👉 Xử lý logout
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        if (onLogout) onLogout(); // cập nhật state ở Navbar
        onClose();
        navigate('/'); // đưa người dùng về trang chủ
    };

    return (
        <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Thông tin cá nhân</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        label="Họ và tên"
                        value={profile.fullname}
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Email"
                        value={profile.email}
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Số điện thoại"
                        value={profile.phonenumber}
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Mật khẩu"
                        value="********"
                        fullWidth
                        disabled
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
                <Button color="error" onClick={handleLogout}>
                    Đăng xuất
                </Button>
            </DialogActions>
        </Dialog>
    );
}
