import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Fade from "react-reveal/Fade";

const styles = {
  buttonContainer: {
    textAlign: "right",
    marginRight: "17%",
  },
  contractBtn: {
    padding: "5px 10px",
    margin: "10px",
    fontSize: "18px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  contractBtn: (isHovered) => ({
    padding: "10px 20px",
    fontFamily: "Lora",
    margin: "10px 0",
    borderRadius: "4px",
    border: "none",
    backgroundColor: isHovered ? "#8CD5FF" : "#545AEC",
    color: isHovered ? "#4775CD" : "#C1E9FF",
    cursor: "pointer",
    justifyContent: "end",
    transition: "background-color 0.3s ease, color 0.3s ease",
  }),
  submitBtn: {
    padding: "5px 10px",
    width: "80px",
    margin: "10px",
    fontSize: "18px",
    border: "1px solid #ffffff",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#444",
    color: "#ffffff",
    transition: "background-color 0.3s ease",
  },
  subBtnContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  container: {
    color: "white",
    fontFamily: "Ubuntu",
    backgroundColor: "#333",
    padding: "3%",
    paddingLeft: "6%",
    borderRadius: "5px",
    width: "80%",
    margin: "35px auto",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
  },
  header: {
    paddingBottom: "10px",
    textAlign: "left",
    color: "#9C9FFB",
    fontSize: "24px",
  },
  formLabel: {
    display: "block",
    textAlign: "left",
    marginBottom: "5px",
    color: "white",
  },
  formInput: {
    width: "80%",
    padding: "10px",
    margin: "5px 0 15px 0",
    marginLeft: "2%",
    border: "1px solid #C1E9FF",
    borderRadius: "4px",
    backgroundColor: "#444",
    color: "white",
    fontSize: "16px",
  },
  formSelect: {
    width: "100%",
    padding: "10px",
    margin: "5px 0 15px 0",
    marginLeft: "2%",
    border: "1px solid #C1E9FF",
    borderRadius: "4px",
    backgroundColor: "#444",
    color: "white",
    fontSize: "16px",
    appearance: "none",
    width: "80%",
  },
};

function ContractInput() {
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    partner: "",
    amount: "",
    start: "",
    end: "",
  });
  const { getIdTokenClaims, isLoading } = useAuth0();
  const [creatorId, setCreatorId] = useState(null);
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);
  // for hover effect
  const [isHovered, setIsHovered] = useState(false);
  const [contractId, setContractId] = useState(null);
  // Use useRef to create a mutable object
  const contractRef = useRef();

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

  const fetchContracts = async () => {
    try {
      const response = await axios.get(
        "https://contract-manager.aquaflare.io/partners/"
      );
      const fetchedPartners = response.data;
      setPartners(fetchedPartners);

      //Fetch all contracts, filter for the logged in user
      const contractsResponse = await axios.get(
        "https://contract-manager.aquaflare.io/contracts/"
      );
      const allContracts = contractsResponse.data;

      const creatorContracts = allContracts.filter((c) => c.user === creatorId);

      // Accumulate contracts in a separate array
      const updatedContracts = creatorContracts.map((c) => ({
        partner: fetchedPartners.find((p) => p.id === c.partner).name,
        amount: c.amount_paid,
        start: c.start_date,
        end: c.end_date,
      }));

      // Update the state once after the loop
      setContracts((prevContracts) => [...updatedContracts]);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [creatorId, contracts]); //dependencies; every time creatorId or contracts changes, re-fetch contracts

  const [errorBanner, setErrorBanner] = useState(null);

  const saveResult = () => {
    const newContract = {
      partner: formData.partner,
      amount: formData.amount,
      start: formData.start,
      end: formData.end,
    };

    if (
      newContract.partner !== "" &&
      newContract.amount !== "" &&
      newContract.start !== "" &&
      newContract.end !== ""
    ) {
      const partnerId = partners.find((p) => p.name === newContract.partner).id;

      //This is a new save, so we POST
      if (contractId === null) {
        try {
          axios
            .post("https://contract-manager.aquaflare.io/contracts/", {
              amount_paid: newContract.amount,
              start_date: newContract.start,
              end_date: newContract.end,
              user: creatorId,
              partner: partnerId,
            })
            .then(() => {
              console.log("Saved successfully!");
              setContracts((prevContracts) => [...prevContracts, newContract]);
            })
            .catch((error) => {
              console.error("Error saving contract info:", error);
              console.log("Server Response:", error.response.data);
            });
        } catch (error) {
          console.log("Error POSTing contract: ", error);
        }
      } else {
        //else, contractId has a value so we put bc we're editing
        try {
          axios
            .put(
              `https://contract-manager.aquaflare.io/contracts/${contractId}/`,
              {
                amount_paid: newContract.amount,
                start_date: newContract.start,
                end_date: newContract.end,
                user: creatorId,
                partner: partnerId,
              }
            )
            .then(() => {
              console.log("Saved successfully!");

              setContracts((prevContracts) =>
                prevContracts.map((c) =>
                  c === contractRef.current ? newContract : c
                )
              );
            })
            .catch((error) => {
              console.error("Error saving contract info:", error);
              console.log("Server Response:", error.response.data);
            });
        } catch (error) {
          console.log("Error PUTTING contract: ", error);
        }
      }
    }

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

  const ShowForm = (edit, contract) => {
    var f = document.getElementById("myForm");
    var ncb = document.getElementById("newContract");
    f.style.display = "block";
    ncb.style.display = "none";
    if (edit) {
      f.partner.value = contract.partner;
      f.amount.value = contract.amount;
      var startDate = contract.start.slice(0, 10);
      f.start.value = startDate;
      var endDate = contract.end.slice(0, 10);
      f.end.value = endDate;
      setFormData({
        partner: contract.partner,
        amount: contract.amount,
        start: startDate,
        end: endDate,
      });
    } else {
      setContractId(null);
    }
  };

  const handleInputChange = (elem) => {
    const { id, value } = elem.target;
    //TODO: this is ugly
    if (id === "amount" && value < 0) {
      setErrorBanner("Amount paid must be greater than or equal to zero.");
    } else if (id === "end") {
      var f = document.getElementById("myForm");
      var startDate = f.start.value;
      if (value <= startDate) {
        setErrorBanner("Start date must be before the end date.");
      } else {
        setErrorBanner(null);
        setFormData({ ...formData, [id]: value });
      }
    } else {
      setErrorBanner(null);
      setFormData({ ...formData, [id]: value });
    }
  };

  useEffect(() => {
    if (contractId !== null) {
      ShowForm(true, contractRef.current);
    }
  }, [contractId]);

  const handleEdit = async (index) => {
    try {
      await fetchContracts();
      const contract = contracts[index];
      contractRef.current = contract;
      //Fetch all contracts, filter for the logged in user
      const contractsResponse = await axios.get(
        "https://contract-manager.aquaflare.io/contracts/"
      );
      const allContracts = contractsResponse.data;

      //TODO: This is ugly.
      const contractToEdit = allContracts.find(
        (c) =>
          c.user === creatorId &&
          c.partner === partners.find((p) => p.name === contract.partner).id &&
          c.amount_paid === contract.amount &&
          c.start === contract.start_date &&
          c.end === contract.end_date
      );

      setContractId(contractToEdit.id);
    } catch (error) {
      console.log("Error fetching contracts: ", error);
    }
  };

  const handleDelete = async (index) => {
    // Create a copy of the contracts array
    const updatedContracts = [...contracts];
    // Remove the contract at the specified index
    updatedContracts.splice(index, 1);
    // Update the state with the new array
    setContracts(updatedContracts);

    try {
      //Fetch all contracts, filter for the logged in user
      const contractsResponse = await axios.get(
        "https://contract-manager.aquaflare.io/contracts/"
      );
      const allContracts = contractsResponse.data;

      const contract = contracts[index];

      //TODO: This is ugly.
      const contractToDelete = allContracts.find(
        (c) =>
          c.user === creatorId &&
          c.partner === partners.find((p) => p.name === contract.partner).id &&
          c.amount_paid === contract.amount &&
          c.start === contract.start_date &&
          c.end === contract.end_date
      );

      try {
        await axios
          .delete(
            `https://contract-manager.aquaflare.io/contracts/${contractToDelete.id}/`
          )
          .then(() => {
            console.log("Deleted successfully!");
          })
          .catch((error) => {
            console.error("Error deleting contract:", error);
          });
      } catch (error) {
        console.log("Error deleting contract: ", error);
      }
    } catch (error) {
      console.log("Error fetching contracts: ", error);
    }
  };

  // Function to format date as Month dd, yyyy (e.g. October 3, 2019)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return utcDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Formats the amount paid to have a $ and separate thousands with commas
  const formatPaid = (amountPaid) => {
    return "$" + amountPaid.toLocaleString();
  };

  // Function to hide the form
  const hideForm = () => {
    setErrorBanner(null);
    var form = document.getElementById("myForm");
    var ncb = document.getElementById("newContract");
    form.style.display = "none";
    ncb.style.display = "block";
  };

  return (
    <div style={styles.container}>
      {/* Display the error banner if it exists */}
      {errorBanner && (
        <div
          style={{ backgroundColor: "red", padding: "10px", color: "white" }}
        >
          {errorBanner}
        </div>
      )}
      <h1 style={styles.header}>Contracts:</h1>
      <h6 styles={{ paddingBottom: "2%", textAlign: "left" }}>
        Input contract information
      </h6>
      <div>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {contracts.map((contract, index) => (
            <li key={index} style={styles.subBtnContainer}>
              {contract.partner}: {formatDate(contract.start)} -{" "}
              {formatDate(contract.end)}. {formatPaid(contract.amount)}
              <div>
                <button
                  style={styles.submitBtn}
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </button>
                <button
                  style={styles.submitBtn}
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Fade bottom>
        <form id="myForm" name="myForm" style={{ display: "none" }}>
          <label style={styles.formLabel} htmlFor="partner">
            Partner:{" "}
          </label>
          <select
            id="partner"
            value={formData.partner}
            onChange={handleInputChange}
            style={styles.formSelect}
          >
            <option>Select...</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.name}>
                {partner.name}
              </option>
            ))}
          </select>
          <br />
          <label style={styles.formLabel} htmlFor="amount">
            Amount Paid (in US Dollars):
          </label>
          <input
            type="number"
            id="amount"
            placeholder="Amount Paid"
            value={formData.amount}
            onChange={handleInputChange}
            style={styles.formInput}
          />
          <br />
          <label style={styles.formLabel} htmlFor="start">
            Contract start date—
          </label>
          <input
            type="date"
            id="start"
            value={formData.start}
            onChange={handleInputChange}
            style={styles.formInput}
          />
          <br />
          <label style={styles.formLabel} htmlFor="end">
            Contract end date—
          </label>
          <input
            type="date"
            id="end"
            value={formData.end}
            onChange={handleInputChange}
            style={styles.formInput}
          />
          <br />
          <div style={styles.buttonContainer}>
            <input
              type="button"
              id="save"
              value="Save"
              onClick={() => saveResult()}
              style={styles.submitBtn}
            />
            <input
              type="button"
              value="Cancel"
              onClick={hideForm}
              style={styles.submitBtn}
            />
          </div>
        </form>
      </Fade>
      <div>
        <button
          onClick={() => ShowForm(false, null)}
          id="newContract"
          style={styles.contractBtn(isHovered)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          + New Contract
        </button>
      </div>
    </div>
  );
}

export default ContractInput;
