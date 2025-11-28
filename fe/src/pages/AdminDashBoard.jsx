import React from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Snackbar, Alert, CircularProgress, Grid, Card, CardContent, Divider
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CancelIcon from '@mui/icons-material/Cancel';

// 1. Import Hook Mới
import useAdminDashboard from '../hooks/useAdminDashboard';

// --- Các Helper UI nhỏ (giữ lại ở đây hoặc chuyển sang utils) ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
};

const getStatusColor = (status) => {
    switch (status) {
        case 'new': return 'error';
        case 'contacted': return 'info';
        case 'converted': return 'success';
        default: return 'default';
    }
};

function StatCard({ title, value, subtext, icon, color }) {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="overline">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: `${color}20`,
                        color: color,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                </Box>
                {subtext && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {subtext}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

// --- COMPONENT CHÍNH ---
export default function AdminDashboard() {
    // 2. Gọi Hook để lấy data và logic
    const {
        registrations,
        loading,
        editData,
        setEditData,
        snack,
        setSnack,
        stats,
        handleExport,
        handleEditClick,
        handleSaveUpdate
    } = useAdminDashboard();

    return (
        <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>

            {/* --- HEADER --- */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                    Dashboard
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExport}
                    sx={{ boxShadow: 2 }}
                >
                    Xuất Báo Cáo Excel
                </Button>
            </Box>

            {/* --- STATS CARDS --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="TỔNG ĐĂNG KÝ" value={stats.total} icon={<PeopleAltIcon />} color="#1976d2" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="ĐÃ LIÊN HỆ" value={`${stats.contactedRate}%`} subtext={`${stats.contacted} khách hàng`} icon={<ContactPhoneIcon />} color="#ed6c02" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="TỶ LỆ CHUYỂN ĐỔI" value={`${stats.convertedRate}%`} subtext={`${stats.converted} khách hàng thành công`} icon={<MonetizationOnIcon />} color="#2e7d32" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="TỶ LỆ HUỶ/TỪ CHỐI" value={`${stats.cancelledRate}%`} subtext={`${stats.cancelled} khách hàng`} icon={<CancelIcon />} color="#d32f2f" />
                </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* --- TABLE --- */}
            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ p: 2, bgcolor: '#fff', fontWeight: 600 }}>
                    Danh sách chi tiết
                </Typography>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Họ tên</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>SĐT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Trạng thái</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Lượt</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Ghi chú</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Ngày đăng ký</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Sửa</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
                            ) : registrations.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.fullname}</TableCell>
                                    <TableCell>{row.phonenumber}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status.toUpperCase()}
                                            color={getStatusColor(row.status)}
                                            size="small"
                                            variant={row.status === 'new' ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell>{row.turn || '-'}</TableCell>
                                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.note}>
                                        {row.note}
                                    </TableCell>
                                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleEditClick(row)} size="small">
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && registrations.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center">Chưa có dữ liệu đăng ký nào.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* --- EDIT DIALOG --- */}
            {editData && (
                <Dialog open={!!editData} onClose={() => setEditData(null)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        Cập nhật: {editData.fullname}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái xử lý</InputLabel>
                                <Select
                                    label="Trạng thái xử lý"
                                    value={editData.status}
                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                >
                                    <MenuItem value="new">Mới (New)</MenuItem>
                                    <MenuItem value="contacted">Đã liên hệ (Contacted)</MenuItem>
                                    <MenuItem value="converted">Đã chốt đơn (Converted)</MenuItem>
                                    <MenuItem value="cancelled">Đã hủy (Cancelled)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Đến lượt của ..."
                                value={editData.turn || ''}
                                onChange={(e) => setEditData({ ...editData, turn: e.target.value })}
                                fullWidth
                                placeholder="Ví dụ: Ca sáng, Gói 1 tháng..."
                                helperText="Gán ca tập hoặc gói dịch vụ cho khách"
                            />

                            <TextField
                                label="Ghi chú nội bộ (Admin Note)"
                                value={editData.note || ''}
                                onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Ghi lại nội dung cuộc gọi hoặc yêu cầu đặc biệt..."
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setEditData(null)} color="inherit">Hủy bỏ</Button>
                        <Button onClick={handleSaveUpdate} variant="contained" color="primary">Lưu thay đổi</Button>
                    </DialogActions>
                </Dialog>
            )}

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}