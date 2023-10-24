import * as React from "react";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useAuth0 } from "@auth0/auth0-react";

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "0px 20px",
    backgroundColor: "white",
    justifyContent: "space-between",
    color: "black",
  },
  links: {
    color: "#210043",
  },
};

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div style={styles.nav}>
      <h3
        style={{
          padding: "7px",
          borderRadius: "90%",
          backgroundColor: "#C188FB",
          border: "none",
          fontSize: "17px",
        }}
      >
        {" "}
        Contract Manager{" "}
      </h3>
      <div style={styles.links}>
        <Nav>
          <NavDropdown
            className="dropdown bg-light bg-large"
            title="☰"
            id="basic-nav-dropdown"
            align="end"
            style={{ fontSize: "20px" }}
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
                href="/Dashboard"
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
