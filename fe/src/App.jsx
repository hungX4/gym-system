// App.jsx (sửa phần JOIN SECTION / "Tham gia ngay" để left/right = 50% on md+)
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Plans from './pages/Plans';
import AboutUs from './pages/AboutUs';
import Container from '@mui/material/Container';
import Navbar from './components/NavBar';
import HeroSection from './components/HeroSection';
import JoinSection from './components/JoinSection';
import Footer from './components/Footer';
import ProfileDialog from './components/Profile';
export default function App() {
  return (
    <Container disableGutters maxWidth={false} sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* NAV */}
      <Navbar />
      {/* routes */}

      {/* HERO */}
      <HeroSection />
      <Routes>
        <Route path="/" element={<Home />} />
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
