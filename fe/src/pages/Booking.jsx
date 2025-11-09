import React, { useMemo, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Snackbar,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// BookingPage.jsx
// - Weekly schedule view (Monday -> Sunday)
// - Hours rows: 6:00 .. 20:00 (each cell is 1 hour slot, ending at 21:00)
// - Switch between weeks
// - Click a cell to toggle a booking (local state)

// Helpers
const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

function startOfWeek(date) {
    // Return Monday of the week for the given date
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // shift: Mon=0, Sun=6
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDateShort(d) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

function makeSlotId(date, hour) {
    // unique id for slot: ISO date (yyyy-mm-dd) + hour
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
}

export default function Booking() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [bookings, setBookings] = useState(() => ({}));
    const [snack, setSnack] = useState({ open: false, message: '' });

    const hours = useMemo(() => Array.from({ length: 15 }, (_, i) => 6 + i), []); // 6..20 inclusive

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    function prevWeek() {
        setWeekStart((w) => addDays(w, -7));
    }
    function nextWeek() {
        setWeekStart((w) => addDays(w, 7));
    }

    function toggleBooking(dayDate, hour) {
        const id = makeSlotId(dayDate, hour);
        setBookings((prev) => {
            const next = { ...prev };
            if (next[id]) {
                delete next[id];
                setSnack({ open: true, message: `Huỷ đặt: ${formatDateShort(dayDate)} ${hour}:00` });
            } else {
                next[id] = { bookedAt: new Date().toISOString() };
                setSnack({ open: true, message: `Đã đặt: ${formatDateShort(dayDate)} ${hour}:00` });
            }
            return next;
        });
    }

    const todayIso = useMemo(() => new Date().toDateString(), []);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Lịch đặt - Booking</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={prevWeek} size="large" title="Tuần trước">
                        <ArrowBackIosNewIcon />
                    </IconButton>

                    <Paper sx={{ px: 2, py: 1 }} elevation={1}>
                        <Typography variant="subtitle1">
                            Tuần của: <strong>{formatDateShort(weekStart)}</strong> — <strong>{formatDateShort(addDays(weekStart, 6))}</strong>
                        </Typography>
                    </Paper>

                    <IconButton onClick={nextWeek} size="large" title="Tuần sau">
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 80, backgroundColor: 'background.paper' }}>Giờ</TableCell>
                            {weekDays.map((d, idx) => {
                                const isToday = d.toDateString() === new Date().toDateString();
                                return (
                                    <TableCell
                                        key={d.toISOString()}
                                        align="center"
                                        sx={{ minWidth: 140, backgroundColor: isToday ? 'rgba(25,118,210,0.06)' : 'inherit' }}
                                    >
                                        <Typography variant="subtitle2">{DAY_NAMES[idx]}</Typography>
                                        <Typography variant="caption">{formatDateShort(d)}</Typography>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {hours.map((hour) => (
                            <TableRow key={hour}>
                                <TableCell sx={{ fontWeight: '600' }}>{`${hour}:00`}</TableCell>

                                {weekDays.map((d) => {
                                    const id = makeSlotId(d, hour);
                                    const booked = Boolean(bookings[id]);

                                    return (
                                        <TableCell key={id} align="center" sx={{ p: 0 }}>
                                            <Button
                                                fullWidth
                                                onClick={() => toggleBooking(d, hour)}
                                                sx={{
                                                    height: 56,
                                                    borderRadius: 0,
                                                    justifyContent: 'center',
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: booked ? 'rgba(244,67,54,0.08)' : 'rgba(25,118,210,0.04)' },
                                                    bgcolor: booked ? 'rgba(244,67,54,0.12)' : 'transparent',
                                                }}
                                                aria-pressed={booked}
                                            >
                                                {booked ? 'Đã đặt' : 'Trống'}
                                            </Button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => setBookings({})} color="inherit">
                    Xoá tất cả
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        // Quick demo: prebook some slots on current week at 18:00 and 19:00
                        const demo = {};
                        weekDays.forEach((d, idx) => {
                            if (idx < 3) {
                                demo[makeSlotId(d, 18)] = { demo: true };
                            }
                        });
                        setBookings(demo);
                        setSnack({ open: true, message: 'Đã tạo demo booking' });
                    }}
                >
                    Tạo demo
                </Button>
            </Box>

            <Snackbar
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                message={snack.message}
                autoHideDuration={2000}
            />
        </Box>
    );
}
