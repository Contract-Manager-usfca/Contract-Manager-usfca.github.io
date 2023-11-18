import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Fade from 'react-reveal/Fade';

const styles = {
  buttonContainer: {
    textAlign: 'right',
    marginRight: '17%',
  },
  contractBtn: {
    padding: "5px 10px",
    margin: "10px",
    fontSize: "18px",
    border: "1px solid #CBE1AE",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#444",
    color: "#CBE1AE",
    // Add hover effect
    transition: "background-color 0.3s ease",
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
  },
  deleteBtn: {
    padding: ".8%",
    margin: "2%",
    fontSize: "18px",
    border: "1px solid #ffffff",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#444",
    color: "#ffffff",
    transition: "background-color 0.3s ease",
  },
  container: {
    color: 'white',
    fontFamily: 'Inria Serif',
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
    color: '#CBE1AE',
  },
  formLabel: {
    display: 'block',
    textAlign: 'left',
    marginBottom: '5px',
    color: 'white',
  },
  formInput: {
    width: '80%',
    padding: '10px',
    margin: '5px 0 15px 0',
    marginLeft: '2%',
    border: '1px solid #8EAA6A',
    borderRadius: '4px',
    backgroundColor: '#444',
    color: 'white',
    fontSize: '16px',
  },
  formSelect: {
    width: '100%',
    padding: '10px',
    margin: '5px 0 15px 0',
    marginLeft: '2%',
    border: '1px solid #8EAA6A',
    borderRadius: '4px',
    backgroundColor: '#444',
    color: 'white',
    fontSize: '16px',
    appearance: 'none',
    width: '80%',
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
  const { getIdTokenClaims, isLoading } = useAuth0();
  const [creatorId, setCreatorId] = useState(null);
  const [partners, setPartners] = useState([]);
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
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

        const creatorContracts = allContracts.filter(
          (c) => c.user === creatorId
        );

        // Accumulate contracts in a separate array
        const updatedContracts = creatorContracts.map((c) => ({
          partner: fetchedPartners.find((p) => p.id === c.partner).name,
          amount: c.amount_paid,
          start: c.start_date,
          end: c.end_date,
        }));

        // Update the state once after the loop
        setContracts((prevContracts) => [
          ...prevContracts,
          ...updatedContracts,
        ]);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };
    fetchContracts();
  }, [creatorId]); //creatorId is a dependency

  const saveResult = (maybeId) => {
    console.log(maybeId);
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
      setContracts((prevContracts) => [...prevContracts, newContract]);

      console.log(maybeId);
      //This is a new save, so we POST
      if (maybeId === null) {
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
            })
            .catch((error) => {
              console.error("Error saving contract info:", error);
              console.log("Server Response:", error.response.data);
            });
        } catch (error) {
          console.log("Error POSTing contract: ", error);
        }
      } else {
        //else, maybeId has a value, so we can PUT
        try {
          axios
            .put(
              `https://contract-manager.aquaflare.io/contracts/${maybeId}/`,
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

  const ShowForm = (edit, contract, id) => {
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

      document.getElementById("save").onclick = () => saveResult(id);
    }
  };

  const handleInputChange = (elem) => {
    const { id, value } = elem.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEdit = async (index) => {
    const contract = contracts[index];

    //show form
    //update contracts array
    //update database

    try {
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
      ShowForm(true, contract, contractToEdit.id);
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

  // Function to format date as dd Month yyyy, e.g. 3 October 2019
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Function to hide the form
  const hideForm = () => {
    var form = document.getElementById("myForm");
    var ncb = document.getElementById("newContract");
    form.style.display = "none";
    ncb.style.display = "block";
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Contracts:</h3>
      <h6 style={styles.header}>
        Input contract information
      </h6>
      <div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {contracts.map((contract, index) => (
            <li key={index} style={styles.listItem}>
              {contract.partner}: {formatDate(contract.start)} - {formatDate(contract.end)}. ${contract.amount}
              {/* TODO: Implement handleEdit functionality */}
              {/* <button style={styles.button} onClick={() => handleEdit(index)}>Edit</button> */}
              <button style={styles.deleteBtn} onClick={() => handleDelete(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <Fade bottom>
      <form id="myForm" name="myForm" style={{ display: "none" }}>
        <label style={styles.formLabel} htmlFor="partner">Partner: </label>
        <select
          id="partner"
          value={formData.partner}
          onChange={handleInputChange}
          style={styles.formSelect}
        >
          <option>Select...</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.name}>{partner.name}</option>
          ))}
        </select>
        <br />
        <label style={styles.formLabel} htmlFor="amount">Amount Paid (in US Dollars):</label>
        <input
          type="number"
          id="amount"
          placeholder="Amount Paid"
          value={formData.amount}
          onChange={handleInputChange}
          style={styles.formInput}
        />
        <br />
        <label style={styles.formLabel} htmlFor="start">Contract start date—</label>
        <input
          type="date"
          id="start"
          value={formData.start}
          onChange={handleInputChange}
          style={styles.formInput}
        />
        <br />
        <label style={styles.formLabel} htmlFor="end">Contract end date—</label>
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
            onClick={() => saveResult(null)}
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
          onClick={() => ShowForm(false, null, null)}
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
