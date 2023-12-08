import * as React from "react";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import typeLogo from '../imgs/typeLogo.png';
import '../styles/basics.css';

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div className="navigation">
      <Link
        to="/"
      >
        <img src={typeLogo} alt="type logo" className="navImg" />
      </Link>
      <div className="navlinks">
        <Nav class=' special bg-transparent'>
          {/* Navbar dropdown menu */}
          <NavDropdown
            className="dropdown bg-large"
            title="☰"
            id="basic-nav-dropdown"
            align="end"
            style={{ fontSize: "23px" }}
          >
            <NavDropdown.Item
              className="nav-item"
              style={{ color: "black" }}
              href="/"
            >
              Home
            </NavDropdown.Item>
            {isAuthenticated && (
              <NavDropdown.Item
                className="nav-item"
                style={{ color: "black" }}
                href="/#/Dashboard"
              >
                Edit Profile
              </NavDropdown.Item>
            )}

            {isAuthenticated && (
              <NavDropdown.Item
                className="nav-item"
                style={{ color: "black" }}
                href="/#/userprofile"
              >
                Profile
              </NavDropdown.Item>
            )}

            {/* If not already authenticated, generate a login button. Otherwise, logout. */}
            {!isAuthenticated ? (
              <NavDropdown.Item
                className="nav_item"
                style={{ color: "black" }}
                onClick={() => loginWithRedirect({})}
              >
                Log In/Sign Up
              </NavDropdown.Item>
            ) : (
              <NavDropdown.Item
                className="nav_item"
                style={{ color: "black" }}
                onClick={() => logout({})}
              >
                Log Out
              </NavDropdown.Item>
            )}
          </NavDropdown>
        </Nav>
      </div>
    </div>
  );
}
