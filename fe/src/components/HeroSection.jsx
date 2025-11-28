import React, { useState } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Box, Button, Typography } from '@mui/material';
import heroSection from '../assets/images/hero-section.jpg';
import { useNavigate, useLocation } from 'react-router-dom';
export default function HeroSection() {

    const navigate = useNavigate();
    const location = useLocation();

    // const handleHeroBtnClick = () => {
    //     if (location.pathname === '/') {
    //         navigate('/register-trial');
    //     }
    //     else if (location === '/register-trial') {
    //         const event = new Event('SCROLL_TO_TRIAL_FORM');
    //         window.dispatchEvent(event);
    //     }
    //     else {
    //         navigate('/register-trial');
    //     }
    // }

    const handleHeroBtnClick = () => {
        const event = new Event('SCROLL_TO_TRIAL_FORM');
        window.dispatchEvent(event);
    }

    return (
        <Box
            sx={{
                position: 'relative',
                backgroundImage: `url(${heroSection})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: { xs: '80vh', md: 'calc(100vh - 72px)' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.35)',
                    zIndex: 1,
                }}
            />
            {/* Text */}
            <Box sx={{ position: 'relative', margin: '300px 0 0 0', zIndex: 2, textAlign: 'center', px: { xs: 2, sm: 4 } }}>
                <Typography
                    variant="h3"
                    sx={{
                        color: 'common.white',
                        fontWeight: 700,
                        fontSize: { xs: '1.6rem', md: '1.6rem' },
                    }}
                >
                    Tăng cường sức khỏe — Bắt đầu hành trình của bạn
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', mt: 1.5, mb: { xs: 2.5, md: 4 }, maxWidth: 720, mx: 'auto' }}>
                    Lộ trình luyện tập cá nhân hoá, huấn luyện trực tiếp và chương trình dinh dưỡng riêng — đăng ký ngay để nhận buổi thử miễn phí.
                </Typography>
            </Box>

            {/* CTA */}
            <Button
                variant="contained"
                color="primary"
                sx={{
                    position: 'absolute',
                    bottom: { xs: 24, md: 24, lg: 60 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#da2128',
                    '&:hover': { bgcolor: '#c62828' },
                    fontWeight: 700,
                    px: { xs: 3, md: 5 },
                    py: { xs: 0.8, md: 1.2 },
                    zIndex: 3,
                    width: { xs: '85%', sm: 'auto' },
                    borderRadius: '0'
                }}
                endIcon={<ArrowDownwardIcon />}
                onClick={handleHeroBtnClick}
            >
                Tham gia ngay
            </Button>

        </Box>
    );
}
