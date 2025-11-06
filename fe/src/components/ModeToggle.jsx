import React from 'react';
import { useColorScheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ModeToggle() {
    const { mode, setMode } = useColorScheme();
    if (!mode) return null;

    const current =
        mode === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : mode;

    return (
        <Button
            size="large"
            onClick={() => setMode(current === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
        >
            {current === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
        </Button>
    );
}
