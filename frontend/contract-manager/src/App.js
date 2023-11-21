// App.js
import React from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/aboutUs";
import ContactUs from "./pages/contactUs";
import UserProfilePage from "./pages/UserProfilePage"; // Import the new page
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Router basename="/">
        <ScrollToTop />
        <div className="flex-column justify-center align-center min-100-vh bg-primary">
          <NavBar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/userprofile" element={<UserProfilePage />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
