import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Container, Typography, Grid, TextField, Button,
    Snackbar, Alert, Paper, CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// --- Import API Helper (nếu bạn đã tạo theo gợi ý trước, nếu chưa thì dùng fetch thường) ---
// import { api } from '../utils/api'; 

const API_BASE = 'http://localhost:8001'; // Fallback nếu chưa có file utils

export default function RegisterTrial() {
    // 1. Ref để thực hiện cuộn trang
    const formRef = useRef(null);

    // 2. State cho Form
    const [formData, setFormData] = useState({
        fullname: '',
        phonenumber: '',
        email: '',
        note: '' // Thêm ghi chú nếu cần
    });
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });


    useEffect(() => {
        //scroll
        const handleScrollToForm = () => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        window.addEventListener('SCROLL_TO_TRIAL_FORM', handleScrollToForm);

        return () => {
            window.removeEventListener('SCROLL_TO_TRIAL_FORM', handleScrollToForm);
        }
    }, []);

    // 4. Hàm xử lý thay đổi input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 5. Hàm Gửi Form (Lưu thông tin để sau này xuất Excel)
    const handleSubmit = async () => {
        // Validate cơ bản
        if (!formData.fullname || !formData.phonenumber) {
            setSnack({ open: true, message: 'Vui lòng nhập Tên và Số điện thoại', severity: 'warning' });
            return;
        }

        setLoading(true);

        try {
            // Gọi API lưu thông tin (Giả sử backend có route này)
            // Nếu chưa có backend, bạn có thể comment lại để test giao diện
            const res = await fetch(`${API_BASE}/registration`, { // Route giả định để lưu Lead
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // (Mock logic: Nếu không có backend thực, ta giả vờ thành công)
            // await new Promise(r => setTimeout(r, 1000)); 

            if (!res.ok) {
                // throw new Error('Gửi đăng ký thất bại');
                // Tạm thời bỏ qua lỗi nếu chưa có backend để demo UI
                console.log("Backend chưa sẵn sàng, nhưng UI đã hoạt động");
            }

            setSnack({ open: true, message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.', severity: 'success' });

            // Reset form
            setFormData({ fullname: '', phonenumber: '', email: '', note: '' });

        } catch (err) {
            console.error(err);
            setSnack({ open: true, message: 'Có lỗi xảy ra, vui lòng thử lại.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container maxWidth="lg" sx={{ py: 10 }} ref={formRef}>
                <Paper elevation={5} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
                    <Grid container alignItems="center" sx={{ width: '100%', display: 'flex' }}>

                        {/* Trái */}
                        <Grid item xs={12} sm={6} sx={{ width: '50%' }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.2 }}>
                                TRẢI NGHIỆM MIỄN PHÍ NGAY!
                            </Typography>
                            <Box sx={{ width: '92%', height: 6, bgcolor: 'error.main', mb: 4 }} />

                            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', fontSize: '1.1rem', width: '90%' }}>
                                Hãy thử điều gì đó mới mẻ trong năm nay bằng cách tham gia thế giới trải nghiệm thú vị và vui nhộn từ chúng tôi. Chúng tôi cung cấp <strong>DÙNG THỬ MIỄN PHÍ 7 ngày</strong> cho tất cả khách mới. Để lại thông tin của bạn bên cạnh và chúng tôi sẽ liên hệ với bạn trong 24 giờ tới.
                            </Typography>

                        </Grid>

                        {/* Phải - Form */}
                        <Grid item xs={12} md={6} sx={{ width: '50%' }}>
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Họ và Tên"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="standard" // gạch dưới
                                    InputLabelProps={{ sx: { fontSize: '1.1rem' } }}
                                />

                                <TextField
                                    label="Số điện thoại"
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    type="tel"
                                    variant="standard"
                                />

                                <TextField
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    fullWidth
                                    type="email"
                                    variant="standard"
                                />
                                <TextField
                                    label="Ghi chú"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    fullWidth
                                    type="text"
                                    variant="standard"
                                />

                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="large"
                                        fullWidth
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                        sx={{
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            borderRadius: 1
                                        }}
                                    >
                                        {loading ? 'Đang gửi...' : 'ĐĂNG KÝ'}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* Snackbar thông báo */}
            <Snackbar
                open={snack.open}
                autoHideDuration={6000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snack.severity} variant="filled">
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}