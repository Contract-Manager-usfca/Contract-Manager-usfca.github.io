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

//TODO remove once done testing
function testResults(form) {
  // const form = document.getElementById("myForm");
  const p = form.elements["partner"];
  let partner = p.value;
  const a = form.elements["amount"];
  let amount = a.value;
  const s = form.elements["start"];
  let start = s.value;
  const e = form.elements["end"];
  let end = e.value;
  console.log(
    "PARTNER: ",
    partner,
    " AMOUNT: ",
    amount,
    " START: ",
    start,
    " END: ",
    end
  );
}

function ElementInput({ ahnClick }) {
  console.log("*click*");
  return (
    <form id="myForm" name="myForm">
      <input type="text" id="partner" placeholder="Partner" />
      <br></br>
      <label htmlFor="amount">$</label>
      <input type="text" id="amount" placeholder="Amount Paid" />
      <br></br>
      <label htmlFor="start">Contract start date— </label>
      <input type="date" id="start" />
      <br></br>
      <label htmlFor="end">Contract end date— </label>
      <input type="date" id="end" />
      <br></br>
      <input
        type="button"
        name="button"
        value="Click"
        onClick={() => ahnClick(document.getElementById("myForm"))}
      />
    </form>
  );
}

function ContractInput() {
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
      <button
        onClick={() => ElementInput(testResults)}
        id="NewContract"
        style={styles.contractBtn}
      >
        + New Contract
      </button>
    </div>
  );
}

export default ContractInput;
