import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const styles = {
  contractBtn: {
    padding: "5px 15px",
    margin: "20px",
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
    display: "block",
  },
  submitBtn: {
    padding: "5px 15px",
    margin: "20px",
    fontSize: "20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "white",
    display: "none",
  },
  // Style for input box
};

function ContractInput() {
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    partner: "",
    amount: "",
    start: "",
    end: "",
  });

  const saveResult = () => {
    const newContract = {
      partner: formData.partner,
      amount: formData.amount,
      start: formData.start,
      end: formData.end,
    };

    setContracts([...contracts, newContract]);

    //Clear form data
    setFormData({
      partner: "",
      amount: "",
      start: "",
      end: "",
    });

    //Form disappears
    var form = document.getElementById("myForm");
    form.style.display = "none";
    var ncb = document.getElementById("newContract");
    ncb.style.display = "block";
  };

  const ShowForm = () => {
    var f = document.getElementById("myForm");
    var ncb = document.getElementById("newContract");
    f.style.display = "block";
    ncb.style.display = "none";
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Function to format date as dd Month yyyy, e.g. 3 October 2019
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
      <h3>Contracts:</h3>
      <h6>
        Here you can input your contract information to compare against other
        content creators.
      </h6>
      <div>
        <ul style={{ fontFamily: "Inria Serif" }}>
          {contracts.map((contract, index) => (
            <li key={index}>
              {contract.partner}: {formatDate(contract.start)} -{" "}
              {formatDate(contract.end)}. ${contract.amount}
              {/* TODO: OnClick */}
              <button>Edit</button>
            </li>
          ))}
        </ul>
      </div>
      <form id="myForm" name="myForm" style={{ display: "none" }}>
        <input
          type="text"
          id="partner"
          placeholder="Partner"
          value={formData.partner}
          onChange={handleInputChange}
        />
        <br></br>
        <label htmlFor="amount">$</label>
        <input
          type="text"
          id="amount"
          placeholder="Amount Paid"
          value={formData.amount}
          onChange={handleInputChange}
        />
        <br></br>
        <label htmlFor="start">Contract start date— </label>
        <input
          type="date"
          id="start"
          value={formData.start}
          onChange={handleInputChange}
        />
        <br></br>
        <label htmlFor="end">Contract end date— </label>
        <input
          type="date"
          id="end"
          value={formData.end}
          onChange={handleInputChange}
        />
        <br></br>
        <input
          type="button"
          name="button"
          value="Save"
          onClick={() => saveResult(document.getElementById("myForm"))}
        />
      </form>
      <div class="center">
        <button
          onClick={() => ShowForm()}
          id="newContract"
          style={styles.contractBtn}
        >
          + New Contract
        </button>
      </div>
    </div>
  );
}

export default ContractInput;
