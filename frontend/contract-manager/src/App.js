import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/HomePage';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <div className="flex-column justify-center align-center min-100-vh bg-primary">
          <NavBar />
          <Routes>
            <Route
              path="/"
              element={<Homepage />}
            />
            <Route
              path="/Dashboard"
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
