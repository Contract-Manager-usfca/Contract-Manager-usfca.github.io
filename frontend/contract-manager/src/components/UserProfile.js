import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "react-bootstrap/esm/Button";

function UserProfile() {
  const { getIdTokenClaims, isLoading, loginWithRedirect, logout } = useAuth0();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoading) {
        try {
          const idTokenClaims = await getIdTokenClaims();
          const name = idTokenClaims?.name || "";
          setUserName(name);
        } catch (error) {
          console.error("Error retrieving ID token claims:", error);
        }
      }
    };

    fetchUserProfile();
  }, [getIdTokenClaims, isLoading]);

  return (
    <div>
      {userName && (
        <p style={{ color: "white", textAlign: "center" }}>
          You're currently logged in as {userName}.
          <Button
            className="btn-margin"
            style={{
              color: "#C188FB",
              backgroundColor: "transparent",
              border: "none",
              fontStyle: "italic",
              textDecoration: "underline",
            }}
            //find a way to log out and immediately bring user back to log in page
            onClick={async () => {
              logout();
            }}
          >
            Not you?
          </Button>
        </p>
      )}
    </div>
  );
}

export default UserProfile;
