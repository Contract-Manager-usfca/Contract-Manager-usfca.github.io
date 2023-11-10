import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const styles = {
  platformBtn: {
    padding: "5px 15px",
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
  },
  submitBtn: {
    padding: "5px 15px",
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
    visibility: "hidden",
  },
  // Style for input box
};

function AddInput(saveId, input1Id, input2Id, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i1 = document.getElementById(input1Id);
  var i2 = document.getElementById(input2Id);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.visibility === "hidden") {
    s.style.visibility = "visible";
    i1.style.visibility = "visible";
    i2.style.visibility = "visible";
    c.style.visibility = "visible";
    d.style.visibility = "visible";
  }
}

function CancelAdd(saveId, input1Id, input2Id, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i1 = document.getElementById(input1Id);
  var i2 = document.getElementById(input2Id);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.visibility === "visible") {
    s.style.visibility = "hidden";
    i1.style.visibility = "hidden";
    i2.style.visibility = "hidden";
    c.style.visibility = "hidden";
    d.style.visibility = "hidden";

    // Reset the input field to empty
    if (i1 && i1.tagName === "INPUT") {
      i1.value = "";
      i2.value = "";
    }
  }
}

function SaveAdd(saveId, input1Id, input2Id, cancelId, elementId, deleteId) {
  CancelAdd(saveId, input1Id, input2Id, cancelId, deleteId);
  var p = document.getElementById(elementId);
  p.style.color = "green";
}

function ElementInput({ element, savedText, onSave, onCancel, onDelete }) {
  const platformStyle = {
    color: savedText ? "green" : "white",
  };
  return (
    <div>
      <div>
        <button
          onClick={() =>
            AddInput(
              `${element}Save`,
              `${element}Input1`,
              `${element}Input2`,
              `${element}Cancel`,
              `${element}Delete`
            )
          }
          id={element}
          style={{ ...styles.platformBtn, ...platformStyle }}
        >
          {element}
        </button>
        <p style={{ display: "inline-block", marginBottom: "-15px" }}>
          {savedText}
        </p>
      </div>
      <div>
        <input
          type="text"
          placeholder="@your_handle"
          id={`${element}Input1`}
          style={{ visibility: "hidden" }}
        />
        <input
          type="text"
          placeholder="Follower Count..."
          id={`${element}Input2`}
          style={{ visibility: "hidden" }}
        />
        <button
          onClick={() =>
            onSave(
              `${element}Save`,
              `${element}Input1`,
              `${element}Input2`,
              `${element}Cancel`,
              element,
              `${element}Delete`
            )
          }
          id={`${element}Save`}
          style={styles.submitBtn}
        >
          Save
        </button>
        <button
          onClick={() =>
            onDelete(
              `${element}Save`,
              `${element}Input1`,
              `${element}Input2`,
              `${element}Cancel`,
              element,
              `${element}Delete`
            )
          }
          id={`${element}Delete`}
          style={styles.submitBtn}
        >
          Delete
        </button>
        <button
          onClick={() =>
            onCancel(
              `${element}Save`,
              `${element}Input1`,
              `${element}Input2`,
              `${element}Cancel`,
              `${element}Delete`
            )
          }
          id={`${element}Cancel`}
          style={styles.submitBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PlatformInput() {
  const { getIdTokenClaims, isLoading } = useAuth0();
  const [creatorId, setCreatorId] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch creator ID on component mount
  useEffect(() => {
    const fetchCreatorId = async () => {
      try {
        if (!isLoading) {
          const idTokenClaims = await getIdTokenClaims();
          const email = idTokenClaims?.email || "";

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

              setCreatorId(userWithUsername.id);
            })
            .catch((error) => {
              console.error("Error fetching users:", error);
            });
        }
      } catch (error) {
        console.error("Error fetching/creating creator ID:", error);
      }
    };

    // Call the fetchCreatorId function when the component mounts or when getIdTokenClaims changes
    fetchCreatorId();
  }, [getIdTokenClaims, isLoading]);

  // Fetch platforms on component mount
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await axios.get(
          "https://contract-manager.aquaflare.io/platforms/"
        );
        const fetchedPlatforms = response.data;

        // Fetch all creator-platform relationships for the logged-in user
        const relationshipsResponse = await axios.get(
          "http://contract-manager.aquaflare.io/creator-platforms/"
        );
        const relationships = relationshipsResponse.data;

        // Update the state for platforms, including the savedText
        setPlatforms(
          fetchedPlatforms.map((p) => {
            const relationship = relationships.find(
              (r) => r.platform === p.id && r.creator === creatorId
            );
            return {
              ...p,
              savedText: relationship
                ? `${relationship.handle}: ${relationship.follower_count} followers.`
                : "", // Set to an empty string if no relationship exists
            };
          })
        );
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };

    fetchPlatforms();
  }, [creatorId]); // Include creatorId as a dependency

  const handleUpdateRelationship = async (
    creatorId,
    platformId,
    inputValue1,
    inputValue2,
    elementId
  ) => {
    // Get the current date and time
    const currentDate = new Date().toISOString(); // Format the date to a string

    const creatorPlatform = {
      follower_count: parseInt(inputValue2),
      handle: inputValue1,
      last_update: currentDate,
      creator: creatorId,
      platform: platformId,
    };

    try {
      // Fetch all creator-platform relationships
      const relationshipsResponse = await axios.get(
        "http://contract-manager.aquaflare.io/creator-platforms/"
      );

      // Find the specific relationship based on creator and platform IDs
      const existingRelationship = relationshipsResponse.data.find(
        (relationship) =>
          relationship.creator === creatorId &&
          relationship.platform === platformId
      );

      // If the relationship exists, update it
      if (existingRelationship) {
        const relationshipId = existingRelationship.id;

        // Send a PATCH/PUT request to update the existing relationship
        await axios.patch(
          `https://contract-manager.aquaflare.io/creator-platforms/${relationshipId}/`,
          {
            followerCount: inputValue2,
            handle: inputValue1,
            last_update: new Date().toISOString(),
            creator: creatorId,
            platform: platformId,
          }
        );

        console.log("Relationship updated successfully!");

        // Update the state for platforms, including the updated savedText
        setPlatforms((prevPlatforms) =>
          prevPlatforms.map((p) =>
            p.name === elementId
              ? {
                  ...p,
                  savedText: `${inputValue1}: ${inputValue2} followers.`,
                }
              : p
          )
        );
      } else {
        // Handle the case where the relationship doesn't exist
        console.log("Relationship does not exist. Making a new one.");
        // Send a POST request to your server to save the data
        axios
          .post(
            "https://contract-manager.aquaflare.io/creator-platforms/",
            creatorPlatform
          )
          .then(() => {
            // Handle success, update UI or state if needed
            // For example, you can update the state to reflect the changes
            setPlatforms((prevPlatforms) =>
              prevPlatforms.map((p) =>
                p.name === elementId
                  ? {
                      ...p,
                      savedText: `${inputValue1}: ${inputValue2} followers.`,
                    }
                  : p
              )
            );

            console.log("Saved successfully!");
          })
          .catch((error) => {
            console.error("Error saving platform info:", error);
            console.log("Server Response:", error.response.data);
          });
      }
    } catch (error) {
      console.error("Error updating relationship:", error);
    }
  };

  const handleInputAndSave = (
    saveId,
    input1Id,
    input2Id,
    cancelId,
    elementId,
    deleteId
  ) => {
    var inputElement1 = document.getElementById(input1Id);
    var inputElement2 = document.getElementById(input2Id);
    if (inputElement1 && inputElement2) {
      const inputValue1 = inputElement1.value;
      const inputValue2 = inputElement2.value;
      if (inputValue1 && inputValue2) {
        // Find platformId based on the selected platform name
        const platform = platforms.find((p) => p.name === elementId);
        if (platform) {
          const platformId = platform.id;

          handleUpdateRelationship(
            creatorId,
            platformId,
            inputValue1,
            inputValue2,
            elementId
          );
          SaveAdd(saveId, input1Id, input2Id, cancelId, elementId, deleteId);
        } else {
          console.error("Platform not found");
        }
        //addPlatformInfo(elementId, inputValue1, inputValue2);

        //On save, match current user with user id in platform table. Update information.
      } else {
        // Handle empty input or other conditions
        // For example, you can display an error message
        CancelAdd(saveId, input1Id, input2Id, cancelId, deleteId);
      }
    }
  };

  const handleDelete = (
    saveId,
    input1Id,
    input2Id,
    cancelId,
    elementId,
    deleteId
  ) => {
    CancelAdd(saveId, input1Id, input2Id, cancelId, deleteId);
    var p = document.getElementById(elementId);
    // Find the platformId based on the selected platform name
    const platform = platforms.find((p) => p.name === elementId);

    // Check if the platform exists
    if (platform) {
      const platformId = platform.id;

      // Fetch all creator-platform relationships
      axios
        .get("http://contract-manager.aquaflare.io/creator-platforms/")
        .then((response) => {
          const relationships = response.data;

          // Find the specific relationship based on creator and platform IDs
          const existingRelationship = relationships.find(
            (relationship) =>
              relationship.creator === creatorId &&
              relationship.platform === platformId
          );

          // If the relationship exists, delete it
          if (existingRelationship) {
            const relationshipId = existingRelationship.id;

            // Send a DELETE request to remove the relationship
            axios
              .delete(
                `https://contract-manager.aquaflare.io/creator-platforms/${relationshipId}/`
              )
              .then(() => {
                console.log("Relationship deleted successfully!");

                // Update the state for platforms, setting savedText to an empty string
                setPlatforms((prevPlatforms) =>
                  prevPlatforms.map((p) =>
                    p.name === elementId ? { ...p, savedText: "" } : p
                  )
                );
              })
              .catch((error) => {
                console.error("Error deleting relationship:", error);
              });
          } else {
            // Handle the case where the relationship doesn't exist
            console.log("Relationship does not exist.");
          }
        })
        .catch((error) => {
          console.error("Error fetching relationships:", error);
        });
    } else {
      console.error("Platform not found");
    }
  };

  return (
    <div
      style={{
        color: "white",
        textAlign: "center",
        paddingLeft: "200px",
        paddingRight: "200px",
      }}
    >
      <h3>Platforms:</h3>
      <h6>Click on a platform to update your handle.</h6>
      {platforms.map((platform) => (
        <ElementInput
          key={platform.name}
          element={platform.name}
          savedText={platform.savedText}
          onSave={handleInputAndSave}
          onCancel={CancelAdd}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default PlatformInput;
