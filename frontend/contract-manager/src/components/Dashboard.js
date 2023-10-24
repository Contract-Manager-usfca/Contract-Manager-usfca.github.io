import React, { useState } from "react";
import UserProfile from "./UserProfile";

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

function AddInput(saveId, inputId, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i = document.getElementById(inputId);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.visibility === "hidden") {
    s.style.visibility = "visible";
    i.style.visibility = "visible";
    c.style.visibility = "visible";
    d.style.visibility = "visible";
  }
}

function CancelAdd(saveId, inputId, cancelId, deleteId) {
  var s = document.getElementById(saveId);
  var i = document.getElementById(inputId);
  var c = document.getElementById(cancelId);
  var d = document.getElementById(deleteId);
  if (s.style.visibility === "visible") {
    s.style.visibility = "hidden";
    i.style.visibility = "hidden";
    c.style.visibility = "hidden";
    d.style.visibility = "hidden";

    // Reset the input field to empty
    if (i && i.tagName === "INPUT") {
      i.value = "";
    }
  }
}

function SaveAdd(saveId, inputId, cancelId, elementId, deleteId) {
  CancelAdd(saveId, inputId, cancelId, deleteId);
  var p = document.getElementById(elementId);
  p.style.color = "green";
}

function ElementInput({ element, savedText, onSave, onCancel, onDelete }) {
  return (
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
        style={styles.platformBtn}
      >
        {element}
      </button>
      <p style={{ display: "inline-block" }}>{savedText}</p>
      <input
        type="text"
        id={`${element}Input`}
        style={{ visibility: "hidden" }}
      />
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
  );
}

function Dashboard() {
  const [savedText, setSavedText] = useState({
    Twitter: "",
    Tiktok: "",
    Instagram: "",
    YouTube: "",
    Race: "",
    Gender: "",
    Sexuality: "",
    Age: "",
    Language: "",
    Residence: "",
    Genre: "",
  });

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
        setSavedText((prevSavedText) => ({
          ...prevSavedText,
          [elementId]: inputValue,
        }));
      } else {
        // Handle empty input or other conditions
        // For example, you can display an error message
      }
    }
    SaveAdd(saveId, inputId, cancelId, elementId, deleteId);
  };

  const handleDelete = (saveId, inputId, cancelId, elementId, deleteId) => {
    CancelAdd(saveId, inputId, cancelId, deleteId);
    var p = document.getElementById(elementId);
    p.style.color = "white";
    setSavedText((prevSavedText) => ({
      ...prevSavedText,
      [elementId]: "",
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#252525",
        paddingBottom: "100px",
      }}
    >
      <h3
        style={{
          backgroundColor: "#C188FB",
          textAlign: "center",
          fontSize: "50px",
        }}
      >
        {" "}
        Welcome!{" "}
      </h3>

      {/* Include the UserProfile component to display the user's name */}
      <UserProfile />

      <div style={{ color: "white" }}>
        <h3>Platforms:</h3>
        <h6>Click on a platform to update your handle.</h6>
        {Object.keys(savedText)
          .filter(
            (platform) =>
              platform === "Twitter" ||
              platform === "Tiktok" ||
              platform === "Instagram" ||
              platform === "YouTube"
          )
          .map((platform) => (
            <ElementInput
              key={platform}
              element={platform}
              savedText={savedText[platform]}
              onSave={handleInputAndSave}
              onCancel={CancelAdd}
              onDelete={handleDelete}
            />
          ))}
        <h3>
          <br></br>Demographics:
        </h3>
        <h6>
          Click on a demographic to update your information. Each of these
          fields are optional, and demographic information is always anonymous.
        </h6>
        {Object.keys(savedText)
          .filter(
            (demographic) =>
              demographic !== "Twitter" &&
              demographic !== "Tiktok" &&
              demographic !== "Instagram" &&
              demographic !== "YouTube"
          )
          .map((demographic) => (
            <ElementInput
              key={demographic}
              element={demographic}
              savedText={savedText[demographic]}
              onSave={handleInputAndSave}
              onCancel={CancelAdd}
              onDelete={handleDelete}
            />
          ))}
      </div>
    </div>
  );
}

export default Dashboard;
