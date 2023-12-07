import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

function UserProfile() {
  const { getIdTokenClaims, isLoading, logout } = useAuth0();
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  // Handle the mouse entering the button
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Handle the mouse leaving the button
  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoading) {
        try {
          const idTokenClaims = await getIdTokenClaims();
          const name = idTokenClaims?.name || "";
          setUserName(name);
          const email = idTokenClaims?.email || "";
          const sub = idTokenClaims?.sub || "";
          // const privateEmail = email.includes("privaterelay");

          // Make a GET request to fetch all users
          axios
            .get("https://contract-manager.aquaflare.io/creators/", {
              withCredentials: true,
            })
            .then((response) => {
              const allUsers = response.data;
              setUsers(allUsers);

              // Filter the users to find the user with the desired username
              const userWithUsername = allUsers.find(
                (user) => user.username === email
              );

              if (!userWithUsername) {
                // User doesn't exist, proceed to create a new user with a POST request
                console.log("User not found, creating a new user.");

                const newUser = {
                  name: name,
                  username: email,
                  password: sub,
                };

                axios
                  .post(
                    "https://contract-manager.aquaflare.io/creators/",
                    newUser,
                    {
                      withCredentials: true,
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  )
                  .then((postResponse) => {
                    console.log(
                      "User created successfully:",
                      postResponse.data
                    );
                  })
                  .catch((postError) => {
                    console.error("Error creating user:", postError);
                  });
              }
            })
            .catch((error) => {
              console.error("Error fetching users:", error);
            });
        } catch (error) {
          console.error("Error retrieving ID token claims:", error);
        }
      }
    };
    fetchUserProfile();
  }, [getIdTokenClaims, isLoading]);

  const styles = {
    container: {
      display: 'flex',
      textAlign: 'center',
      justifyContent: 'space-between',
      padding: '2% 5% 0% 6%',
    },
    logoutButton: {
      color: isHovering ? "#8CD5FF" : "#ffff",
      transition: 'color 0.3s ease, color 0.3s ease',
      backgroundColor: "transparent",
      border: "none",
      fontStyle: "italic",
      textDecoration: "underline",
      cursor: "pointer",
      fontSize: '1em',
    },
    h1: {
      color: "#C1E9FF",
      textAlign: 'left',
      fontSize: '2.5em',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>{userName}</h1>
      {userName && (
        <button
          onClick={() => logout()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={styles.logoutButton}
        >
          Not you?
        </button>
      )}
    </div>
  );
}

export default UserProfile;
