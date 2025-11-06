import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ModeToggle from './ModeToggle';
import { NavLink } from 'react-router-dom';
const items = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Đặt lịch', to: '/booking' },
    { label: 'Lộ Trình', to: '/plans' },
    { label: 'Liên Hệ', to: '/contact' },
];

export default function Navbar() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 1.5, md: 2 },
                bgcolor: 'background.paper',
                boxShadow: 2,
                position: 'sticky',
                top: 0,
                zIndex: 1200,
            }}
        >
            <Typography variant="h6" fontWeight="bold">
                HOANG KIM COACH
            </Typography>

            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2, md: 3 }, alignItems: 'center' }}>
                {items.map((item) => (
                    <Button
                        key={item.to}
                        component={NavLink}
                        to={item.to}
                        color="inherit"
                        sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            // style active NavLink: when matched, NavLink adds .active class
                            '&.active': {
                                fontWeight: 700,
                                textDecoration: 'underline',
                            },
                        }}
                        end={item.to === '/'} // ensure exact for home
                    >
                        {item.label}
                    </Button>
                ))}
                <ModeToggle />
            </Box>
        </Box>
    );
}