import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const styles = {
  container: {
    color: 'white',
    fontFamily: 'Ubuntu',
    backgroundColor: '#333',
    padding: '3%',
    paddingLeft: '6%',
    borderRadius: '5px',
    width: '80%',
    margin: '35px auto',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
  },
  header: {
    paddingBottom: '10px',
    textAlign: 'left',
    color: '#9C9FFB',
    fontSize: '24px',
  },
  platformBtn: {
    padding: "5px 15px",
    margin: "20px",
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
  },
  submitBtn: {
    padding: "5px 10px",
    margin: "10px",
    fontSize: "18px",
    border: "1px solid #ffffff",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#444",
    color: "#ffffff",
    transition: "background-color 0.3s ease",
    display: "none",
  },
  inputBox: {
    width: '80%',
    padding: '10px',
    margin: '5px 0 15px 0',
    marginLeft: '2%',
    border: '1px solid #C1E9FF',
    borderRadius: '4px',
    backgroundColor: '#444',
    color: 'white',
    fontSize: '16px',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  btnContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '83%',
    marginTop: '10px',
  },
};

function AddInput(saveId, inputId, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i = document.getElementById(inputId);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.display === "none") {
    s.style.display = "inline-block";
    i.style.display = "inline-block";
    c.style.display = "inline-block";
    d.style.display = "inline-block";
  }
}

function CancelAdd(saveId, inputId, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i = document.getElementById(inputId);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.display === "inline-block") {
    s.style.display = "none";
    i.style.display = "none";
    c.style.display = "none";
    d.style.display = "none";

    // Reset the input field to empty
    if (i && i.tagName === "INPUT") {
      i.value = "";
    }
  }
}

function ElementInput({ element, savedText, onSave, onCancel, onDelete }) {
  const platformStyle = {
    color: savedText ? "#67C9FF" : "#ffff",
  };
  return (
    <div>
      <div>
        <button
          onClick={() =>
            AddInput(
              `${element}Save`,
              `${element}Input`,
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
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Demographic..."
            id={`${element}Input`}
            style={{ ...styles.inputBox, display: "none" }}
          />
        </div>
        <div style={styles.btnContainer}>
          <button
            onClick={() =>
              onSave(
                `${element}Save`,
                `${element}Input`,
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
                `${element}Input`,
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
                `${element}Input`,
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
    inputValue,
    elementId
  ) => {
    // Get the current date and time
    const currentDate = new Date().toISOString(); // Format the date to a string

    const creatorDemographic = {
      demo: inputValue,
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
            demo: inputValue,
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
                savedText: `${inputValue}`,
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
                    savedText: `${inputValue}`,
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
    inputId,
    cancelId,
    elementId,
    deleteId
  ) => {
    var inputElement = document.getElementById(inputId);
    if (inputElement) {
      const inputValue = inputElement.value;
      if (inputValue) {
        const demographic = demographics.find(
          (d) => d.demographic === elementId
        );
        if (demographic) {
          const demographicId = demographic.id;

          handleUpdateRelationship(
            creatorId,
            demographicId,
            inputValue,
            elementId
          );
        } else {
          console.error("Demographic not found");
        }
      }
      CancelAdd(saveId, inputId, cancelId, deleteId);
    }
  };

  const handleDelete = (saveId, inputId, cancelId, elementId, deleteId) => {
    CancelAdd(saveId, inputId, cancelId, deleteId);
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
    <div style={styles.container}>
      <h1 style={styles.header}>Demographics:</h1>
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
