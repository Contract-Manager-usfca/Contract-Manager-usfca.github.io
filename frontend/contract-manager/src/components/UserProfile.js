import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";

function UserProfile() {
  const { getIdTokenClaims, isLoading, loginWithRedirect, logout } = useAuth0();
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoading) {
        try {
          const idTokenClaims = await getIdTokenClaims();
          const name = idTokenClaims?.name || "";
          setUserName(name);
          const email = idTokenClaims?.email || "";
          const sub = idTokenClaims?.sub || "";

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

              if (userWithUsername) {
                // User already exists, proceed with a PATCH request
                console.log("User already exists:", userWithUsername);

                const updatedUser = {
                  name: name,
                  username: email,
                  password: sub,
                };

                axios
                  .patch(
                    `https://contract-manager.aquaflare.io/creators/${userWithUsername.id}`,
                    updatedUser,
                    {
                      withCredentials: true,
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  )
                  .then((patchResponse) => {
                    console.log(
                      "User updated successfully:",
                      patchResponse.data
                    );
                  })
                  .catch((patchError) => {
                    console.error("Error updating user:", patchError);
                    // Log the complete error response for debugging
                    if (patchError.response) {
                      console.error(
                        "Error response data:",
                        patchError.response.data
                      );
                    }
                  });
              } else {
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

  return (
    <div>
      (
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
          onClick={async () => {
            logout();
          }}
        >
          Not you?
        </Button>
      </p>
    </div>
  );
}

export default UserProfile;
