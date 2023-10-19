import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/HomePage';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import SignIn from "./components/SignIn";
import Register from "./components/Register";

function App() {
  return (
    <div>
      <Router>
        <div className="flex-column justify-center align-center min-100-vh bg-primary">
          <NavBar />
          <Routes>
            <Route
              path="/"
              element={<Homepage />}
            />
            <Route
              path="/SignIn"
              element={<SignIn />}
            />
            <Route
              path="/Register"
              element={<Register />}
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </div>
  )
}

export default App;
