import React from "react";
import './App.css';
// Import HashRouter
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/HomePage';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Use HashRouter instead of BrowserRouter */}
      <Router basename="/">
        <div className="flex-column justify-center align-center min-100-vh bg-primary">
          <NavBar />
          <Routes>
            <Route
              path="/"
              element={<Homepage />}
            />
            <Route
              path="/Dashboard" // Consider using lowercase "/dashboard" for consistency
              element={<Dashboard />}
            />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
