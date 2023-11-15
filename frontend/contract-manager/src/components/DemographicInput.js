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
};

function AddInput(saveId, input1Id, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i1 = document.getElementById(input1Id);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.visibility === "hidden") {
    s.style.visibility = "visible";
    i1.style.visibility = "visible";
    c.style.visibility = "visible";
    d.style.visibility = "visible";
  }
}

function CancelAdd(saveId, input1Id, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i1 = document.getElementById(input1Id);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.visibility === "visible") {
    s.style.visibility = "hidden";
    i1.style.visibility = "hidden";
    c.style.visibility = "hidden";
    d.style.visibility = "hidden";

    // Reset the input field to empty
    if (i1 && i1.tagName === "INPUT") {
      i1.value = "";
    }
  }
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
              //TODO Make Input not Input1
              `${element}Input1`,
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
          placeholder="Demographic..."
          id={`${element}Input1`}
          style={{ visibility: "hidden" }}
        />
        <button
          onClick={() =>
            onSave(
              `${element}Save`,
              `${element}Input1`,
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

function DemographicInput() {
  const { getIdTokenClaims, isLoading } = useAuth0();
  const [creatorId, setCreatorId] = useState(null);
  const [demographics, setDemographics] = useState([]);
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

  // Fetch demographics on component mount
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const response = await axios.get(
          "https://contract-manager.aquaflare.io/demographics/"
        );
        const fetchedDemographics = response.data;

        // Fetch all creator-demographic relationships for the logged-in user
        const relationshipsResponse = await axios.get(
          "https://contract-manager.aquaflare.io/creator-demographics/"
        );
        const relationships = relationshipsResponse.data;

        // Update the state for demographics, including the savedText
        setDemographics(
          fetchedDemographics.map((d) => {
            const relationship = relationships.find(
              (r) => r.demographic === d.id && r.creator === creatorId
            );
            return {
              ...d,
              savedText: relationship ? `${relationship.demo}` : "", // Set to an empty string if no relationship exists
            };
          })
        );
      } catch (error) {
        console.error("Error fetching demographics:", error);
      }
    };

    fetchDemographics();
  }, [creatorId]); // Include creatorId as a dependency

  const handleUpdateRelationship = async (
    creatorId,
    demographicId,
    inputValue1,
    elementId
  ) => {
    // Get the current date and time
    const currentDate = new Date().toISOString(); // Format the date to a string

    const creatorDemographic = {
      demo: inputValue1,
      last_update: currentDate,
      creator: creatorId,
      demographic: demographicId,
    };

    try {
      // Fetch all creator-demographic relationships
      const relationshipsResponse = await axios.get(
        "https://contract-manager.aquaflare.io/creator-demographics/"
      );

      // Find the specific relationship based on creator and demographic IDs
      const existingRelationship = relationshipsResponse.data.find(
        (relationship) =>
          relationship.creator === creatorId &&
          relationship.demographic === demographicId
      );

      // If the relationship exists, update it
      if (existingRelationship) {
        const relationshipId = existingRelationship.id;

        // Send a PUT request to update the existing relationship
        await axios.put(
          `https://contract-manager.aquaflare.io/creator-demographics/${relationshipId}/`,
          {
            demo: inputValue1,
            last_update: currentDate,
            creator: creatorId,
            demographic: demographicId,
          }
        );

        console.log("Relationship updated successfully!");

        // Update the state for demographics, including the updated savedText
        setDemographics((prevDemographics) =>
          prevDemographics.map((d) =>
            d.demographic === elementId
              ? {
                  ...d,
                  savedText: `${inputValue1}`,
                }
              : d
          )
        );
      } else {
        // Handle the case where the relationship doesn't exist
        console.log("Relationship does not exist. Making a new one.");
        // Send a POST request to your server to save the data
        axios
          .post(
            "https://contract-manager.aquaflare.io/creator-demographics/",
            creatorDemographic
          )
          .then(() => {
            // Handle success, update UI or state if needed
            // For example, you can update the state to reflect the changes
            setDemographics((prevDemographics) =>
              prevDemographics.map((d) =>
                d.demographic === elementId
                  ? {
                      ...d,
                      savedText: `${inputValue1}`,
                    }
                  : d
              )
            );

            console.log("Saved successfully!");
          })
          .catch((error) => {
            console.error("Error saving demographic info:", error);
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
    cancelId,
    elementId,
    deleteId
  ) => {
    var inputElement1 = document.getElementById(input1Id);
    if (inputElement1) {
      const inputValue1 = inputElement1.value;
      if (inputValue1) {
        const demographic = demographics.find(
          (d) => d.demographic === elementId
        );
        if (demographic) {
          const demographicId = demographic.id;

          handleUpdateRelationship(
            creatorId,
            demographicId,
            inputValue1,
            elementId
          );
        } else {
          console.error("Demographic not found");
        }
      }
      CancelAdd(saveId, input1Id, cancelId, deleteId);
    }
  };

  const handleDelete = (saveId, input1Id, cancelId, elementId, deleteId) => {
    CancelAdd(saveId, input1Id, cancelId, deleteId);
    // Find the demographicId based on the selected demographic name
    const demographic = demographics.find((d) => d.demographic === elementId);

    // Check if the demographic exists
    if (demographic) {
      const demographicId = demographic.id;

      // Fetch all creator-demographic relationships
      axios
        .get("https://contract-manager.aquaflare.io/creator-demographics/")
        .then((response) => {
          const relationships = response.data;

          // Find the specific relationship based on creator and demographic IDs
          const existingRelationship = relationships.find(
            (relationship) =>
              relationship.creator === creatorId &&
              relationship.demographic === demographicId
          );

          // If the relationship exists, delete it
          if (existingRelationship) {
            const relationshipId = existingRelationship.id;

            // Send a DELETE request to remove the relationship
            axios
              .delete(
                `https://contract-manager.aquaflare.io/creator-demographics/${relationshipId}/`
              )
              .then(() => {
                console.log("Relationship deleted successfully!");

                // Update the state for demographics, setting savedText to an empty string
                setDemographics((prevDemographics) =>
                  prevDemographics.map((d) =>
                    d.demographic === elementId ? { ...d, savedText: "" } : d
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
      console.error("Demographic not found");
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
      <h3>Demographics:</h3>
      <h6>
        Click on a demographic to update your information. Each of these fields
        are optional, and demographic information is always anonymous.
      </h6>
      {demographics.map((demographic) => (
        <ElementInput
          key={demographic.demographic}
          element={demographic.demographic}
          savedText={demographic.savedText}
          onSave={handleInputAndSave}
          onCancel={CancelAdd}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default DemographicInput;
