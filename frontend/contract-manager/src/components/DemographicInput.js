import React, { useState } from "react";

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

function SaveAdd(saveId, input1Id, cancelId, elementId, deleteId) {
  CancelAdd(saveId, input1Id, cancelId, deleteId);
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
            `${element}Input1`,
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
  );
}

function DemographicInput() {
  const [savedText, setSavedText] = useState({
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
    input1Id,
    cancelId,
    elementId,
    deleteId
  ) => {
    var inputElement1 = document.getElementById(input1Id);
    if (inputElement1) {
      const inputValue1 = inputElement1.value;
      if (inputValue1) {
        setSavedText((prevSavedText) => ({
          ...prevSavedText,
          [elementId]: inputValue1,
        }));
        SaveAdd(saveId, input1Id, cancelId, elementId, deleteId);
      } else {
        // Handle empty input or other conditions
        // For example, you can display an error message
        CancelAdd(saveId, input1Id, cancelId, deleteId);
      }
    }
  };

  const handleDelete = (saveId, input1Id, cancelId, elementId, deleteId) => {
    CancelAdd(saveId, input1Id, cancelId, deleteId);
    var p = document.getElementById(elementId);
    p.style.color = "white";
    setSavedText((prevSavedText) => ({
      ...prevSavedText,
      [elementId]: "",
    }));
  };

  return (
    <div style={{ color: "white" }}>
      <h3>Demographics:</h3>
      <h6>
        Click on a demographic to update your information. Each of these fields
        are optional, and demographic information is always anonymous.
      </h6>
      {Object.keys(savedText).map((platform) => (
        <ElementInput
          key={platform}
          element={platform}
          savedText={savedText[platform]}
          onSave={handleInputAndSave}
          onCancel={CancelAdd}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default DemographicInput;
