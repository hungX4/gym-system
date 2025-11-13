import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    FormControl, // <<< Thêm
    InputLabel,  // <<< Thêm
    Select,      // <<< Thêm
    MenuItem,    // <<< Thêm
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8001';

export default function ProfileDialog({ open, onClose, onLogout }) {
    const [profile, setProfile] = React.useState({
        fullname: '',
        email: '',
        phonenumber: '',
        role: '',         // <<< Thêm
        // (Từ UserDetail)
        address: '',
        gender: '',
        specialty_id: '', // <<< Thêm
    });
    const [newPassword, setNewPassword] = React.useState('');
    const [specialties, setSpecialties] = React.useState([]); // <<< Thêm state cho chuyên môn

    const [loading, setLoading] = React.useState(false);
    const [submitLoading, setSubmitLoading] = React.useState(false);
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    const navigate = useNavigate();

    // 👉 Lấy thông tin profile VÀ danh sách chuyên môn
    React.useEffect(() => {
        if (open) {
            const fetchProfile = async () => {
                setLoading(true);
                setSpecialties([]); // Reset
                try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) {
                        onClose();
                        return;
                    }

                    // ----- SỬA LỖI Ở ĐÂY (Thêm "Cache Buster") -----
                    const cacheBuster = `?t=${Date.now()}`;

                    // 1. Fetch thông tin user và user_detail
                    const res = await fetch(`${API_BASE}/users/profile${cacheBuster}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: 'no-store'
                    });

                    if (!res.ok) throw new Error('Không thể tải thông tin cá nhân');

                    const data = await res.json();

                    // Set state với dữ liệu từ cả 2 bảng
                    setProfile({
                        fullname: data.fullname ?? '',
                        email: data.email ?? '',
                        phonenumber: data.phonenumber ?? '',
                        role: data.role ?? 'user',

                        // Đọc từ 'data.detail' (giống hệt backend)
                        address: data.detail?.address ?? '',
                        gender: data.detail?.gender ?? '',
                        specialty_id: data.detail?.specialty_id ?? '',

                    });
                    setNewPassword('');

                    // 2. NẾU user là coach, fetch danh sách chuyên môn
                    if (data.role === 'coach') {
                        const specRes = await fetch(`${API_BASE}/specialty${cacheBuster}`); // <<< Route MỚI
                        if (specRes.ok) {
                            const specData = await specRes.json();
                            setSpecialties(specData || []);
                        }
                    }

                } catch (err) {
                    console.error(err);
                    setSnack({ open: true, severity: 'error', message: err.message });
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [open, onClose]);

    // Hàm cập nhật state (dùng chung cho cả TextField và Select)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // 👉 Xử lý CẬP NHẬT profile
    const handleUpdateProfile = async () => {
        setSubmitLoading(true);
        const token = localStorage.getItem('accessToken');

        // Build payload. Gửi TẤT CẢ thông tin trong state 'profile'
        // Backend sẽ tự xử lý cập nhật User và UserDetail
        const payload = { ...profile };

        // Xóa 'role' và 'email' ra khỏi payload (thường không cho sửa)
        delete payload.role;
        delete payload.email;

        // Chỉ thêm password nếu có nhập mới
        if (newPassword.trim()) {
            payload.password = newPassword;
        }

        try {
            const res = await fetch(`${API_BASE}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
                body: JSON.stringify(payload), // Gửi profile state (đã bỏ role/email)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Cập nhật thất bại');
            }

            setSnack({ open: true, severity: 'success', message: 'Cập nhật thành công!' });
            onClose();

        } catch (err) {
            console.error(err);
            setSnack({ open: true, severity: 'error', message: err.message });
        } finally {
            setSubmitLoading(false);
        }
    };

    // 👉 Xử lý logout (Giữ nguyên)
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        if (onLogout) onLogout();
        onClose();
        navigate('/');
    };
    // console.log("ĐÂY LÀ PROFILE STATE:", JSON.stringify(profile));
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
                                value={profile.fullname}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={profile.email}
                                fullWidth
                                disabled // Email không cho sửa
                            />
                            <TextField
                                label="Số điện thoại"
                                name="phonenumber"
                                value={profile.phonenumber}
                                onChange={handleChange}
                                fullWidth
                            />

                            {/* --- TRƯỜNG MỚI --- */}
                            <TextField
                                label="Địa chỉ"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                fullWidth
                                placeholder="Ví dụ: 123 Đường ABC, Q1, TPHCM"
                            />
                            <FormControl fullWidth>
                                <InputLabel>Giới tính</InputLabel>
                                <Select
                                    label="Giới tính"
                                    name="gender"
                                    value={profile.gender ?? ''}
                                    onChange={handleChange}
                                >
                                    <MenuItem value=""><em>(Không chọn)</em></MenuItem>
                                    <MenuItem value="male">Nam</MenuItem>
                                    <MenuItem value="female">Nữ</MenuItem>
                                    <MenuItem value="other">Khác</MenuItem>
                                </Select>
                            </FormControl>

                            {/*  TRƯỜNG CÓ ĐIỀU KIỆN */}
                            {profile.role === 'coach' && (
                                <FormControl fullWidth>
                                    <InputLabel>Chuyên môn</InputLabel>
                                    <Select
                                        label="Chuyên môn"
                                        name="specialty_id"
                                        value={profile.specialty_id ?? ''}
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
                            {/* --- KẾT THÚC TRƯỜG CÓ ĐIỀU KIỆN --- */}

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
                    <Button color="error" onClick={handleLogout} disabled={submitLoading}>
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