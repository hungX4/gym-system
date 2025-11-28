import { useState, useEffect, useMemo } from 'react';

const API_BASE = 'http://localhost:8001';

export default function useAdminDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho Dialog Edit
    const [editData, setEditData] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

    // 1. Fetch Danh sách
    const fetchList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/registration`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Không thể tải danh sách');
            const data = await res.json();
            setRegistrations(data);
        } catch (err) {
            setSnack({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    // 2. Tính toán Thống kê (Business Logic)
    const stats = useMemo(() => {
        const total = registrations.length;
        if (total === 0) return { total: 0, contactedRate: 0, convertedRate: 0, cancelledRate: 0 };

        const contacted = registrations.filter(r => r.status === 'contacted').length;
        const converted = registrations.filter(r => r.status === 'converted').length;
        const cancelled = registrations.filter(r => r.status === 'cancelled').length;

        return {
            total,
            contacted,
            converted,
            cancelled,
            contactedRate: ((contacted / total) * 100).toFixed(1),
            convertedRate: ((converted / total) * 100).toFixed(1),
            cancelledRate: ((cancelled / total) * 100).toFixed(1),
        };
    }, [registrations]);

    // 3. Xử lý Xuất Excel
    const handleExport = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/registration/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Lỗi xuất file');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DanhSachDangKy_${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            setSnack({ open: true, message: 'Xuất file thành công!', severity: 'success' });
        } catch (err) {
            setSnack({ open: true, message: err.message, severity: 'error' });
        }
    };

    // 4. Xử lý Dialog & Update
    const handleEditClick = (reg) => {
        setEditData({ ...reg });
    };

    const handleSaveUpdate = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/registration/${editData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: editData.status,
                    turn: editData.turn,
                    note: editData.note
                })
            });

            if (!res.ok) throw new Error('Cập nhật thất bại');

            setSnack({ open: true, message: 'Cập nhật thành công!', severity: 'success' });
            setEditData(null);
            fetchList();
        } catch (err) {
            setSnack({ open: true, message: err.message, severity: 'error' });
        }
    };

    // Trả về tất cả những gì UI cần
    return {
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
    };
}