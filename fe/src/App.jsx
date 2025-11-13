// App.jsx (sửa phần JOIN SECTION / "Tham gia ngay" để left/right = 50% on md+)
import { React, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { useNavigate } from 'react-router-dom';
import Booking from './pages/Booking';
import Plans from './pages/Plans';
import AboutUs from './pages/AboutUs';
import Container from '@mui/material/Container';
import Navbar from './components/NavBar';
import HeroSection from './components/HeroSection';
import JoinSection from './components/JoinSection';
import Footer from './components/Footer';
import ProfileDialog from './components/Profile';
import AboutCoach from './pages/AboutCoach';
import AuthDialog from './components/AuthDialog';
import BookingForCoach from './pages/BookingForCoach';
export default function App() {
  // 1. "Cần lái"
  const navigate = useNavigate();

  // 2. STATE TRUNG TÂM (Bộ não)
  // Quản lý xem ai đó đã đăng nhập chưa
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  // Quản lý dialog đăng nhập
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  // Quản lý dialog profile
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  // ----- THÊM MỚI: Lưu role của user -----
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole'));

  // 3. "BỘ ĐIỀU HƯỚNG" (Khi đăng nhập thành công)
  const handleLoginRedirect = (data) => {
    // data = { token: '...', users: { role: '...' } }
    setIsLoggedIn(true);
    setAuthDialogOpen(false); // Đóng dialog đăng nhập
    console.log(data);
    // ----- LƯU ROLE VÀO STATE/STORAGE -----
    const role = data.user?.role; // Lấy role, mặc định là 'user'
    setUserRole(role);
    localStorage.setItem('userRole', role); // Lưu lại để F5 không mất
    // ----------------------------------------------------


    if (role === 'coach') {
      navigate('/bookingforcoach'); // Lái Coach
    } else {
      navigate('/'); // Lái User
    }
  };

  // 4. HÀM ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setProfileDialogOpen(false); // Đóng Profile Dialog nếu nó đang mở
    navigate('/'); // Về trang chủ
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* NAV */}
      <Navbar
        isLoggedIn={isLoggedIn} // << Trạng thái
        userRole={userRole}
        onOpenAuthDialog={() => setAuthDialogOpen(true)} // << Công tắc mở Auth
        onOpenProfileDialog={() => setProfileDialogOpen(true)} // << Công tắc mở Profile
        onLogout={handleLogout} // << Công tắc Đăng xuất
      />
      {/* routes */}
      {/* Component Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onLoginSuccess={handleLoginRedirect} // <-- 6. Gắn "não" vào Dialog
      />
      {/* HERO */}
      <HeroSection />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AboutCoach" element={<AboutCoach />} />
        <Route path="/bookingforcoach" element={<BookingForCoach />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onLoginSuccess={handleLoginRedirect}
      />

      {/* ProfileDialog sẽ gọi 'handleLogout' khi bấm đăng xuất */}
      <ProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        onLogout={handleLogout}
      />
      {/* JOIN SECTION / "Tham gia ngay" */}
      <JoinSection />

      {/* FOOTER */}
      <Footer />

    </Container>
  );
}
