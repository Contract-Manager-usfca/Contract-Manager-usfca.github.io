import * as React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Auth from '../utils/auth';
import SignIn from "./SignIn";
import Register from "./Register";

// Mock Auth object for demonstration
// const Auth = {
//   loggedIn: () => false,
//   getProfile: () => ({ data: { username: 'JohnDoe' } }),
// };

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '0px 20px',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    color: 'black',
  },
  links: {
    color: '#210043',
  },
};

export default function Navbar() {
  // Placeholder logout function
  const logout = () => {
    console.log("Logging out");
    // Implement logout logic here
  };

  return (
    <div style={styles.nav}>
      <h3 style={{ padding: '7px', borderRadius: '90%', backgroundColor: '#C188FB', border: 'none', fontSize: '17px' }}> Contract Manager </h3>
      <div style={styles.links}>
        <Nav>
          <NavDropdown className="dropdown bg-light bg-large" title="☰" id="basic-nav-dropdown" align="end" style={{ fontSize: '20px' }}>
          <NavDropdown.Item className="nav-item" style={{ color: 'black' }} href="/">Home</NavDropdown.Item>
            {/* <NavDropdown.Item className="nav-item" style={{ color: 'black' }} href="/">Profile</NavDropdown.Item> */}
            <NavDropdown.Item className="nav-item" style={{ color: 'black' }} href="/SignIn">Sign In</NavDropdown.Item>
            <NavDropdown.Item className="nav-item" style={{ color: 'black' }} href="/Register">Create Account</NavDropdown.Item>
            {/* {Auth.loggedIn() ? (
              <>
                <NavDropdown.Item className="nav-item" href="/me">{Auth.getProfile().data.username}'s profile</NavDropdown.Item>
                <NavDropdown.Item className="nav-item" onClick={logout}>Logout</NavDropdown.Item>
              </>
            ) : (
              <>
                <NavDropdown.Item className="nav-item" href="/login">Login</NavDropdown.Item>
                <NavDropdown.Item className="nav-item" href="/signup">Signup</NavDropdown.Item>
              </>
            )} */}
          </NavDropdown>
        </Nav>
      </div>
    </div>
  );
}
