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

  const saveResult = () => {
    const newContract = {
      partner: formData.partner,
      amount: formData.amount,
      start: formData.start,
      end: formData.end,
    };

    const partnerId = partners.find((p) => p.name === newContract.partner).id;

    if (
      newContract.partner !== "" &&
      newContract.amount !== "" &&
      newContract.start !== "" &&
      newContract.end !== ""
    ) {
      setContracts((prevContracts) => [...prevContracts, newContract]);
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
              <button
                className="btn-margin"
                style={{
                  color: "#C188FB",
                  backgroundColor: "transparent",
                  border: "none",
                  fontStyle: "italic",
                  textDecoration: "underline",
                }}
              >
                Edit
              </button>
              {/* TODO: OnClick */}
              <button
                className="btn-margin"
                style={{
                  color: "#C188FB",
                  backgroundColor: "transparent",
                  border: "none",
                  fontStyle: "italic",
                  textDecoration: "underline",
                }}
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <form id="myForm" name="myForm" style={{ display: "none" }}>
        <label htmlFor="partner">Who'd you partner with?</label>
        <select
          id="partner"
          value={formData.partner}
          onChange={handleInputChange}
        >
          <option>Select...</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.name}>
              {partner.name}
            </option>
          ))}
        </select>
        <br></br>
        <label htmlFor="amount">Amount Paid (in US Dollars): </label>
        <input
          type="number"
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
