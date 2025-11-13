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
export default function App() {
  // 2. Lấy "cần lái"
  const navigate = useNavigate();

  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // 3. ĐÂY LÀ HÀM QUYẾT ĐỊNH
  const handleLoginRedirect = (data) => {
    // 'data' là cái object { token: '...', user: { role: 'coach' } }
    // mà AuthDialog vừa "ném" lên

    // 4. KIỂM TRA QUYỀN VÀ "LÁI"
    if (data.users && data.users.role === 'coach') {
      navigate('/coach/schedule'); // Lái Coach
    } else {
      navigate('/booking'); // Lái User
    }

    // 5. Sau khi "lái", đóng Dialog
    setAuthDialogOpen(false);
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* NAV */}
      <Navbar />
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
        <Route path="/booking" element={<Booking />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/aboutUs" element={<AboutUs />} />

        <Route path="*" element={<Home />} />
      </Routes>
      {/* JOIN SECTION / "Tham gia ngay" */}
      <JoinSection />

      {/* FOOTER */}
      <Footer />

    </Container>
  );
}
