import React from 'react';
import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, Snackbar,
    CircularProgress
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// --- 1. Import Hook (Bộ não) ---
import useCoachSchedule from '../hooks/useBookingForCoach';

// --- 2. Import Dialog (UI Con) ---
import BookingDetailForCoachDialog from '../components/BookingDetailForCoachDialog';

// --- 3. Import Helpers (Tiện ích) ---
import { DAY_NAMES, formatDateShort, makeSlotId, getSlotSummary, addDays } from '../utils/bookingHelper';


// +++ COMPONENT CHÍNH (Chỉ Render) +++
export default function BookingForCoach() {

    // --- 4. Lấy tất cả logic từ Hook ---
    const {
        loading,
        weekStart,
        weekDays,
        hours,
        bookingsBySlot,
        selectedSlotData,
        snack,
        setSnack,
        prevWeek,
        nextWeek,
        handleCellClick,
        handleCloseDialog
    } = useCoachSchedule();

    // --- 5. Chỉ Render ---
    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* --- Phần Header (Tuần/Nút) --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Lịch dạy của Coach</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={prevWeek} size="large" title="Tuần trước" disabled={loading}>
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <Paper sx={{ px: 2, py: 1 }} elevation={1}>
                        <Typography variant="subtitle1">
                            Tuần: <strong>{formatDateShort(weekStart)}</strong> — <strong>{formatDateShort(addDays(weekStart, 6))}</strong>
                        </Typography>
                    </Paper>
                    <IconButton onClick={nextWeek} size="large" title="Tuần sau" disabled={loading}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

            <TableContainer component={Paper} sx={{ overflowX: 'auto', opacity: loading ? 0.5 : 1 }}>
                <Table stickyHeader>
                    {/* --- TableHead (Thứ/Ngày) --- */}
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

                    {/* --- TableBody (Các Slot) --- */}
                    <TableBody>
                        {hours.map((hour) => (
                            <TableRow key={hour}>
                                <TableCell sx={{ fontWeight: '600' }}>{`${hour}:00`}</TableCell>

                                {weekDays.map((d) => {
                                    const id = makeSlotId(d, hour);
                                    const bookingsForSlot = bookingsBySlot[id];
                                    const summary = getSlotSummary(bookingsForSlot);
                                    const isPast = new Date(id) < new Date();

                                    return (
                                        <TableCell key={id} align="center" sx={{ p: 0 }}>
                                            <Button
                                                fullWidth
                                                onClick={() => handleCellClick(d, hour)}
                                                disabled={!bookingsForSlot || bookingsForSlot.length === 0} // Disable nếu ô trống
                                                sx={{
                                                    height: 56, borderRadius: 0,
                                                    textTransform: 'none',
                                                    color: summary.style.color || 'inherit',
                                                    bgcolor: summary.style.bgcolor || 'transparent',
                                                    opacity: (isPast && !bookingsForSlot) ? 0.4 : (summary.style.opacity || 1),
                                                    '&:hover': {
                                                        bgcolor: summary.style.bgcolor ? summary.style.bgcolor : 'action.hover',
                                                        filter: 'brightness(90%)'
                                                    },
                                                }}
                                            >
                                                {summary.label}
                                            </Button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- DIALOG MỚI: Dành cho Coach --- */}
            {selectedSlotData && (
                <BookingDetailForCoachDialog
                    slotData={selectedSlotData}
                    open={!!selectedSlotData}
                    onClose={handleCloseDialog}
                    setSnack={setSnack}
                />
            )}

            <Snackbar
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                message={snack.message}
                autoHideDuration={2000}
            />
        </Box>
    );
}