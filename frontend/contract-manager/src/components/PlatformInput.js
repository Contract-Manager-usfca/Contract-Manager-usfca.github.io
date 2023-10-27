import React, { useState } from "react";

const styles = {
  platformBtn: {
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
    marginBottom: "15px",
  },
  submitBtn: {
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
    visibility: "hidden",
  },
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
  return (
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
        style={styles.platformBtn}
      >
        {element}
      </button>
      <p style={{ display: "inline-block" }}>{savedText}</p>
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
  );
}

function PlatformInput() {
  const [savedText, setSavedText] = useState({
    Twitter: "",
    Tiktok: "",
    Instagram: "",
    YouTube: "",
  });

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
        setSavedText((prevSavedText) => ({
          ...prevSavedText,
          [elementId]: inputValue1 + ": " + inputValue2 + " followers.",
        }));
        SaveAdd(saveId, input1Id, input2Id, cancelId, elementId, deleteId);
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
    p.style.color = "white";
    setSavedText((prevSavedText) => ({
      ...prevSavedText,
      [elementId]: "",
    }));
  };

  return (
    <div style={{ color: "white" }}>
      <h3>Platforms:</h3>
      <h6>Click on a platform to update your handle.</h6>
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

export default PlatformInput;
