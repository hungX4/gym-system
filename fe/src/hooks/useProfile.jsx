import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8001';

// Lớp 1: Khởi tạo state "SẠCH"
const getInitialProfileState = () => ({
    fullname: '',
    email: '',
    phonenumber: '',
    role: 'user',
    address: '',
    gender: '',
    specialty_id: '',
});

// Đây là "bộ não" mới của ProfileDialog
export default function useProfile(open, onClose) {
    const [profile, setProfile] = useState(getInitialProfileState);
    const [newPassword, setNewPassword] = useState('');
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const navigate = useNavigate();

    // 👉 Lấy thông tin profile VÀ danh sách chuyên môn
    useEffect(() => {
        if (open) {
            const fetchProfile = async () => {
                setLoading(true);
                setSpecialties([]); // Reset
                try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) {
                        onClose();
                        return;
                    }
                    const cacheBuster = `?t=${Date.now()}`;

                    const res = await fetch(`${API_BASE}/users/profile${cacheBuster}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: 'no-store'
                    });
                    if (!res.ok) throw new Error('Không thể tải thông tin cá nhân');
                    const data = await res.json();

                    setProfile({
                        fullname: data.fullname ?? '',
                        email: data.email ?? '',
                        phonenumber: data.phonenumber ?? '',
                        role: data.role ?? 'user',
                        address: data.detail?.address ?? '',
                        gender: data.detail?.gender ?? '',
                        specialty_id: data.detail?.specialty_id ?? '',
                    });
                    setNewPassword('');

                    if (data.role === 'coach') {
                        const specRes = await fetch(`${API_BASE}/specialty${cacheBuster}`, {
                            cache: 'no-store'
                        });
                        if (specRes.ok) {
                            const specData = await specRes.json();
                            setSpecialties(specData || []);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    setSnack({ open: true, severity: 'error', message: err.message });
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        } else {
            setProfile(getInitialProfileState());
        }
    }, [open, onClose]);

    // Hàm cập nhật state (dùng chung cho cả TextField và Select)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // 👉 Xử lý CẬP NHẬT profile
    const handleUpdateProfile = async () => {
        setSubmitLoading(true);
        const token = localStorage.getItem('accessToken');

        const payload = { ...profile };
        delete payload.role;
        delete payload.email;
        if (newPassword.trim()) {
            payload.password = newPassword;
        }

        try {
            const res = await fetch(`${API_BASE}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Cập nhật thất bại');
            }
            setSnack({ open: true, severity: 'success', message: 'Cập nhật thành công!' });

            // <<< LỖI ĐÃ ĐƯỢC FIX Ở ĐÂY (KHÔNG TỰ ĐỘNG ĐÓNG) >>>
            // onClose(); 

        } catch (err) {
            console.error(err);
            setSnack({ open: true, severity: 'error', message: err.message });
        } finally {
            setSubmitLoading(false);
        }
    };

    // 👉 Xử lý logout
    const handleLogout = (onLogoutCallback) => {
        localStorage.removeItem('accessToken');
        if (onLogoutCallback) onLogoutCallback();
        onClose();
        navigate('/');
    };

    // Trả về mọi thứ mà Component cần để render
    return {
        profile,
        newPassword,
        setNewPassword,
        specialties,
        loading,
        submitLoading,
        snack,
        setSnack,
        handleChange,
        handleUpdateProfile,
        handleLogout
    };
}