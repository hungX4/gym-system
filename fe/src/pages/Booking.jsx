import React from 'react';
import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, Snackbar,
    CircularProgress
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// --- 1. Import Hook (Bộ não) ---
import useBooking from '../hooks/useBooking';

// --- 2. Import Dialog (UI Con) ---
import BookingDetailDialog from '../components/BookingDetailDialog';

// --- 3. Import Helpers (Tiện ích) ---
import {
    DAY_NAMES, addDays, formatDateShort,
    makeSlotId, getStatusStyle
} from '../utils/bookingHelper';


// +++ COMPONENT CHÍNH (Chỉ còn Render) +++
export default function Booking() {

    // --- 4. Lấy tất cả logic từ Hook ---
    const {
        loading,
        weekStart,
        weekDays,
        hours,
        bookings, // Đổi tên từ bookingsBySlot
        selectedSlot, // Đổi tên từ selectedSlotData
        snack,
        setSnack,
        prevWeek,
        nextWeek,
        handleCellClick,
        handleCloseDialog
    } = useBooking();

    // --- 5. Chỉ Render ---
    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* --- Phần Header (Tuần/Nút) --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Lịch đặt của tôi</Typography>
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

            {/* --- Hiển thị Loading --- */}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

            <TableContainer component={Paper} sx={{ overflowX: 'auto', opacity: loading ? 0.5 : 1 }}>
                <Table stickyHeader>
                    {/* --- TableHead  --- */}
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
                                    const bookingData = bookings[id];
                                    const style = getStatusStyle(bookingData?.status);
                                    const isPast = new Date(id) < new Date();

                                    return (
                                        <TableCell key={id} align="center" sx={{ p: 0 }}>
                                            <Button
                                                fullWidth
                                                onClick={() => handleCellClick(d, hour)}
                                                sx={{
                                                    height: 56, borderRadius: 0,
                                                    textTransform: 'none',
                                                    color: style.color || 'inherit',
                                                    bgcolor: style.bgcolor || 'transparent',
                                                    opacity: isPast && !bookingData ? 0.4 : 1, // Mờ đi nếu là quá khứ và trống
                                                    '&:hover': {
                                                        bgcolor: style.bgcolor ? style.bgcolor : 'action.hover',
                                                        filter: 'brightness(90%)'
                                                    },
                                                }}
                                            >
                                                {bookingData ? style.label : 'Trống'}
                                            </Button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- BookingDetailDialog:  Hiển thị/Tạo chi tiết Booking --- */}
            {selectedSlot && (
                <BookingDetailDialog
                    slotData={selectedSlot}
                    open={!!selectedSlot}
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