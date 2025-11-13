// src/pages/CoachesPage.jsx (hoặc AboutCoach.jsx)
import React from 'react';
import {
    Box, Grid, Card, CardContent, CardActions,
    Typography, Avatar, Button, CircularProgress
} from '@mui/material';
import CoachDialog from '../components/CoachDialog';
import { useNavigate } from 'react-router-dom';
import AuthDialog from '../components/AuthDialog'; // <<< THÊM VÀO

const API_BASE = 'http://localhost:8001';

export default function AboutCoach() {
    const [coaches, setCoaches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedCoach, setSelectedCoach] = React.useState(null);
    const [openDialog, setOpenDialog] = React.useState(false);
    const navigate = useNavigate();

    // --- State cho Auth ---
    // <<< THÊM VÀO
    const [openAuth, setOpenAuth] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(
        !!localStorage.getItem('accessToken')
    );
    // State để nhớ coachId người dùng muốn đặt sau khi đăng nhập
    const [pendingCoachId, setPendingCoachId] = React.useState(null);
    // ---

    React.useEffect(() => {
        let mounted = true;
        const token = window.localStorage.getItem('accessToken');

        fetch(`${API_BASE}/bookings/coachlist`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(async (res) => {
                if (!res.ok) {
                    const txt = await res.text();
                    // Nếu lỗi là 401, không cần báo lỗi, chỉ là chưa đăng nhập
                    // (Giả sử bạn đã gỡ auth ở backend, nhưng nếu chưa, 
                    // bạn có thể check res.status === 401 ở đây)
                    throw new Error(txt || 'Lỗi khi lấy danh sách coach');
                }
                return res.json();
            })
            .then(data => {
                if (!mounted) return;
                setCoaches(data || []);
            })
            .catch(err => {
                console.error(err);
                if (mounted) setError(err.message || 'Lỗi mạng');
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []); // Đảm bảo useEffect này chạy đúng ý bạn

    const handleOpen = (coach) => {
        setSelectedCoach(coach);
        setOpenDialog(true);
    };
    const handleClose = () => {
        setOpenDialog(false);
        setSelectedCoach(null);
    };

    // --- Hàm điều hướng "gác cổng" ---
    // <<< THÊM VÀO
    const handleGoToBooking = (coachId) => {
        if (isLoggedIn) {
            navigate(`/booking?coachId=${coachId}`);
        } else {
            // Chưa đăng nhập, lưu lại ý định và mở dialog
            setPendingCoachId(coachId);
            setOpenAuth(true);
        }
    };
    // ---

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 3 }}>
            <Typography color="error">Lỗi: {error}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Danh sách Huấn luyện viên</Typography>
            <Grid container spacing={2}>
                {coaches.map(coach => (
                    <Grid item xs={12} sm={6} md={4} key={coach.id}>
                        <Card>
                            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Avatar sx={{ width: 64, height: 64 }}>{(coach.fullname || 'C').charAt(0)}</Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{coach.fullname}</Typography>
                                    <Typography variant="body2" color="text.secondary">{coach.email || '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary">SĐT: {coach.phonetumber}</Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleOpen(coach)}>Xem & Đặt lịch</Button>

                                {/* // <<< SỬA LẠI */}
                                <Button size="small" onClick={() => handleGoToBooking(coach.id)}>Trang đặt lịch</Button>

                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {selectedCoach && (
                <CoachDialog
                    open={openDialog}
                    onClose={handleClose}
                    coachId={selectedCoach.id}
                    coachSummary={selectedCoach}

                    // <<< SỬA LẠI
                    // Đảm bảo nút bên trong dialog cũng dùng logic auth
                    onGoToBooking={(id) => handleGoToBooking(id)}
                />
            )}

            {/* // <<< THÊM VÀO */}
            {/* Dialog đăng nhập */}
            <AuthDialog
                open={openAuth}
                onClose={() => {
                    setOpenAuth(false);
                    setPendingCoachId(null); // Hủy ý định nếu đóng dialog
                }}
                onLoginSuccess={() => {
                    setOpenAuth(false);
                    setIsLoggedIn(true);
                    // Đăng nhập thành công, kiểm tra xem có 
                    // ý định đặt lịch nào đang chờ không
                    if (pendingCoachId) {
                        navigate(`/booking?coachId=${pendingCoachId}`);
                    }
                    setPendingCoachId(null); // Xóa ý định
                }}
            />
        </Box>
    );
}