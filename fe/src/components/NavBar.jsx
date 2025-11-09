import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ModeToggle from './ModeToggle';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthDialog from './AuthDialog';
import ProfileDialog from './Profile';
const leftItem = [{
    label: 'Trang chủ', to: '/'
}]

const rightItem = [
    { label: 'Đặt lịch', to: '/booking' },
    { label: 'Lộ Trình', to: '/plans' },
    { label: 'Liên Hệ', to: '/contact' },
    { label: 'Profile', to: '/profile' },
]

export default function Navbar() {
    const navigate = useNavigate();
    const [openAuth, setOpenAuth] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(
        !!localStorage.getItem('accessToken')
    );
    const [openProfile, setOpenProfile] = React.useState(false);
    const handleNavClick = (e, item) => {
        // if it's a NavLink or anchor, prevent default when blocking
        if ((item.to === '/booking' || item.to === '/profile') && !isLoggedIn) {
            e?.preventDefault();
            setOpenAuth(true);
            return;
        }
        if (item.to === '/profile' && isLoggedIn) {
            e?.preventDefault();
            setOpenProfile(true);
            return;
        }
        // otherwise navigate programmatically
        navigate(item.to);
    };

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
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2, md: 3 }, alignItems: 'center' }}>
                {leftItem.map((item) => (
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
                    //brand name here
                ))}
            </Box>

            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2, md: 3 }, alignItems: 'center' }}>
                {rightItem.map((item) => (
                    <Button
                        key={item.to}

                        onClick={(e) => handleNavClick(e, item)}
                        color="inherit"
                        sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            // style active NavLink: when matched, NavLink adds .active class
                            '&.active': {
                                fontWeight: 700,
                                textDecoration: 'underline',
                            },
                        }}
                    // end={item.to === '/'} // ensure exact for home
                    >
                        {item.label}
                    </Button>
                ))}
                <ModeToggle />
            </Box>
            <AuthDialog
                open={openAuth}
                onClose={() => setOpenAuth(false)}
                onLoginSuccess={() => {
                    setOpenAuth(false);
                    setIsLoggedIn(true);
                    navigate('/booking'); // tự chuyển tới trang đặt lịch
                }}
            />
            <ProfileDialog
                open={openProfile}
                onClose={() => setOpenProfile(false)}
            />
        </Box>
    );
}