import { Box, Typography, Grid, TextField, Link, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
export default function HeroSection() {
    return (
        <Box
            component="section"
            sx={{
                py: { xs: 6, md: 10 },
                px: { xs: 10, sm: 6, md: 6 },
                bgcolor: 'background.default',
            }}
        >
            {/* Heading row (separate container so it won't mix with the card row) */}
            <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ mb: 6 }}>
                <Grid item xs={12} md={8}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Tham gia ngay
                        </Typography>
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                            Nhận tư vấn miễn phí và lịch tập phù hợp với mục tiêu của bạn.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Card row: use a proper Grid container so item widths behave correctly */}
            <Grid container spacing={0} justifyContent="center">
                <Grid item xs={12} md={10}>
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 3,
                            px: { xs: 3, md: 6 },
                            py: { xs: 3, md: 4 },
                            mx: 'auto',
                        }}
                    >
                        {/* Inner grid: left + right 50/50 on md+ */}
                        <Grid container spacing={3} alignItems="stretch">
                            {/* Left: info */}
                            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                        Sẵn sàng bắt đầu?
                                    </Typography>
                                    <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                                        Điền email hoặc số điện thoại để chúng tôi liên hệ và thiết kế lộ trình phù hợp.
                                    </Typography>

                                    <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                                        <Button
                                            variant="contained"
                                            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#115293' } }}
                                        >
                                            Xem gói tập
                                        </Button>
                                        <Button variant="outlined">Liên hệ</Button>
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* Right: simple form */}
                            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                                    <TextField
                                        placeholder="Email hoặc số điện thoại"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                    <Button variant="contained" sx={{ bgcolor: '#e53935', '&:hover': { bgcolor: '#c62828' }, whiteSpace: 'nowrap' }}>
                                        Nhận tư vấn
                                    </Button>
                                </Box>

                                <Box sx={{ mt: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
                                    <Typography component="span">Bằng việc đăng ký, bạn đồng ý với </Typography>
                                    <Link href="#" underline="hover">Điều khoản</Link>
                                    <Typography component="span"> & </Typography>
                                    <Link href="#" underline="hover">Chính sách bảo mật</Link>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}