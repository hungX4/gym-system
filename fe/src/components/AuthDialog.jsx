import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Snackbar,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function AuthDialog({ open, onClose, onLoginSuccess }) {
    const [mode, setMode] = React.useState('login'); // 'login' | 'register'
    const [loading, setLoading] = React.useState(false);

    // form state
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [fullname, setName] = React.useState('');
    const [phonenumber, setPhone] = React.useState('');

    // messages
    const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

    // simple validation helpers
    const validateRegister = () => {
        if (!fullname.trim()) return 'Hãy nhập họ tên';
        if (!email.trim()) return 'Hãy nhập email';
        if (!password.trim() || password.length < 6) return 'Mật khẩu cần ≥ 6 ký tự';
        if (!phonenumber.trim()) return 'Hãy nhập số điện thoại';
        return null;
    };
    const validateLogin = () => {
        if (!phonenumber.trim()) return 'Hãy nhập số điện thoại';
        if (!password.trim()) return 'Hãy nhập mật khẩu';
        return null;
    };

    // simulate register API
    const handleRegister = async () => {
        const err = validateRegister();
        if (err) {
            setSnack({ open: true, severity: 'error', message: err });
            return;
        }
        setLoading(true);

        // simulate network
        // setTimeout(() => {
        //     setLoading(false);
        //     setSnack({ open: true, severity: 'success', message: 'Đăng ký thành công! Hãy đăng nhập.' });
        //     // switch to login and keep email filled
        //     setMode('login');
        // }, 900);
        try {
            const rest = await fetch('http://localhost:8001/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // nếu backend dùng cookie cho refresh token
                body: JSON.stringify({
                    fullname,
                    email,
                    phonenumber,
                    password
                })
            });
            // try parse JSON safely
            let data = null;
            const text = await rest.text();
            try { data = text ? JSON.parse(text) : null; } catch (e) { data = { raw: text }; }

            setLoading(false);

            if (!rest.ok) {
                // handle known cases
                if (rest.status === 400 && data && data.errors) {
                    // pick first validation error message if available
                    const first = data.errors[0];
                    setSnack({ open: true, severity: 'error', message: first.msg || 'Validation error' });
                    return;
                }
                if (rest.status === 409) {
                    setSnack({ open: true, severity: 'error', message: (data && data.message) || 'Số điện thoại đã tồn tại' });
                    return;
                }
                // fallback message
                setSnack({ open: true, severity: 'error', message: (data && (data.message || data.raw)) || `Đăng ký lỗi (${rest.status})` });
                return;
            }

            // success (201)
            setSnack({ open: true, severity: 'success', message: (data && (data.message || 'Đăng ký thành công')) || 'Đăng ký thành công' });

            // autofill login fields (keep phone/email so user dễ đăng nhập)
            setMode('login');
            setPhone(phonenumber);
            setEmail(email);
            // clear password for security
            setPassword('');
        } catch (error) {
            console.error('Register error:', err);
            setLoading(false);
            setSnack({ open: true, severity: 'error', message: 'Không thể kết nối tới server' });
        }
    };

    // simulate login API
    const handleLogin = async () => {
        const err = validateLogin();
        if (err) {
            setSnack({ open: true, severity: 'error', message: err });
            return;
        }
        setLoading(true);
        // setTimeout(() => {
        //     setLoading(false);
        //     setSnack({ open: true, severity: 'success', message: 'Đăng nhập thành công' });
        //     // close dialog after short delay (simulate redirect)
        //     setTimeout(() => {
        //         setSnack({ open: false, severity: 'success', message: '' });
        //         onClose?.();
        //     }, 600);
        // }, 900);
        try {
            const res = await fetch('http://localhost:8001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // nếu backend dùng cookie cho refresh token
                body: JSON.stringify({ phonenumber, password })
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) {
                setSnack({ open: true, severity: 'error', message: data.message || 'Đăng nhập lỗi' });
                return;
            }
            // lưu access token ở nơi tạm thời (memory / redux) hoặc httpOnly cookie (nếu backend trả cookie)
            // ví dụ lưu tạm:
            window.localStorage.setItem('accessToken', data.accessToken);

            setSnack({ open: true, severity: 'success', message: 'Đăng nhập thành công' });
            onLoginSuccess?.();
            // tiếp hành động: fetch profile, redirect, đóng dialog
            onClose?.();
        } catch (err) {
            setLoading(false);
            setSnack({ open: true, severity: 'error', message: 'Lỗi kết nối' });
        }
    };

    // reset when opening/closing
    React.useEffect(() => {
        if (!open) {
            setMode('login');
            setEmail('');
            setPassword('');
            setName('');
            setPhone('');
            setLoading(false);
        }
    }, [open]);

    return (
        <>
            <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {mode === 'login' ? 'Chào mừng trở lại! Điền thông tin để đăng nhập.' : 'Tạo tài khoản mới bằng email của bạn.'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gap: 2 }}>
                        {mode === 'register' && (
                            <>
                                <TextField
                                    label="Họ và tên"
                                    value={fullname}
                                    onChange={(e) => setName(e.target.value)}
                                    fullWidth
                                    autoFocus
                                    name='name'
                                />
                                <TextField
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    type="email"
                                    name='email'
                                />
                            </>

                        )}


                        <TextField
                            label="Số điện thoại"
                            value={phonenumber}
                            onChange={(e) => setPhone(e.target.value)}
                            fullWidth
                            name='phonenumber'
                            type="tel"
                            autoFocus={mode === 'login'}
                        />


                        <TextField
                            label="Mật khẩu"
                            name='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            type="password"
                        />

                        {/* optional: small helper text */}
                        {mode === 'register' && (
                            <Typography variant="caption" color="text.secondary">
                                Mật khẩu tối thiểu 6 ký tự.
                            </Typography>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={mode === 'login' ? handleLogin : handleRegister}
                            disabled={loading}
                        >
                            {mode === 'login' ? (loading ? 'Đang đăng nhập...' : 'Đăng nhập') : (loading ? 'Đang đăng ký...' : 'Đăng ký')}
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                        {mode === 'login' ? (
                            <Typography variant="body2">
                                Chưa có tài khoản?{' '}
                                <Button onClick={() => { setMode('register'); }} variant="text" size="small">
                                    Đăng ký
                                </Button>
                            </Typography>
                        ) : (
                            <Typography variant="body2">
                                Đã có tài khoản?{' '}
                                <Button onClick={() => { setMode('login'); }} variant="text" size="small">
                                    Đăng nhập
                                </Button>
                            </Typography>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Snackbar for messages */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
}
