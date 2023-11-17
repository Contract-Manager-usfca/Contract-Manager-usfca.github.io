import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import '../styles/UserProfilePage.css';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '20px',
    padding: '20px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  section: {
    backgroundColor: 'white',
    margin: '10px 0',
    padding: '20px',
    borderRadius: '8px',
  },
  header: {
    fontSize: '1.5em',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#777',
  },
};

function UserProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [profileData, setProfileData] = useState(null);
  const [demographicsData, setDemographicsData] = useState([]);
  const [contractsData, setContractsData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [partnersData, setPartnersData] = useState([]);

  const [groupedByPartner, setGroupedByPartner] = useState(false);
  const [groupedContractsData, setGroupedContractsData] = useState([]);

  useEffect(() => {
      const fetchData = async () => {
          if (!isLoading && isAuthenticated && user) {
              try {
                  // Fetch user profile
                  const userResponse = await axios.get(`https://contract-manager.aquaflare.io/creators/?username=${user.email}`, {
                      withCredentials: true,
                  });
                  const userProfile = userResponse.data.find(profile => profile.username === user.email);
                  if (userProfile) {
                      setProfileData(userProfile);

                      // Fetch demographics
                      const demographicsResponse = await axios.get(`https://contract-manager.aquaflare.io/creator-demographics/?creator=${userProfile.id}`);
                      setDemographicsData(demographicsResponse.data.filter(demo => demo.creator === userProfile.id));

                      // Fetch contracts
                      const contractsResponse = await axios.get('https://contract-manager.aquaflare.io/contracts/');
                      const userContracts = contractsResponse.data.filter(contract => contract.user === userProfile.id);
                      setContractsData(userContracts);

                      // Calculate total earnings
                      setTotalEarnings(userContracts.reduce((acc, contract) => acc + contract.amount_paid, 0));

                      // Fetch partners
                      const partnersResponse = await axios.get('https://contract-manager.aquaflare.io/partners/');
                      setPartnersData(partnersResponse.data);
                  }
              } catch (error) {
                  console.error('Error fetching data:', error);
              }
          }
      };


      fetchData();
  }, [user, isAuthenticated, isLoading]);

  // Function to group contracts by partner
  const groupContractsByPartner = () => {
    const groupedData = partnersData.map(partner => {
        const contracts = contractsData.filter(contract => contract.partner === partner.id);
        const total = contracts.reduce((acc, contract) => acc + contract.amount_paid, 0);
        return { partnerName: partner.name, total, contracts };
    }).filter(group => group.total > 0); // Filter out groups with 0 total earnings

    setGroupedContractsData(groupedData);
};

    // Toggle button handler
    const handleToggleGroupedView = () => {
        setGroupedByPartner(!groupedByPartner);
        if (!groupedByPartner) {
            groupContractsByPartner();
        }
    };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>User is not authenticated</div>;
  }

    return (
      <div className="container mt-5 mb-5" style={styles.container}>
          {/* Profile Image and Name Section */}
          <div className="row no-gutters">
              <div className="col-md-4 col-lg-4">
                  <img src="https://i.imgur.com/tdi3NGa.png" alt="Profile" />
              </div>
              <div className="col-md-8 col-lg-8">
                  <div className="d-flex flex-column">
                      <div className="d-flex flex-row justify-content-between align-items-center p-5 bg-dark text-white">
                          <h3 className="display-5">{profileData?.name}</h3>
                          {/* Icons can be dynamically rendered based on available data */}
                          <i className="fa fa-facebook"></i>
                          {/* ... other icons ... */}
                      </div>
                      <div className="p-3 bg-black text-white">
                          <h6>{/* User's Role or Description */}</h6>
                      </div>

                      {/* Demographics Section */}
                      <div className="p-3 bg-dark text-white">
                          <h6>Demographics:</h6>
                          {demographicsData.map((demo, index) => (
                              <div key={index} style={styles.row}>
                                  <span style={styles.label}>{/* Demographic name here */}:</span>
                                  <span style={styles.value}>{demo.demo}</span>
                              </div>
                          ))}
                      </div>
                       {/* Contracts Section */}
                      <div style={styles.section}>
                          <h2 style={styles.header}>
                              Contracts
                              <button onClick={handleToggleGroupedView}>
                                  {groupedByPartner ? 'Show Individual' : 'Group by Partner'}
                              </button>
                          </h2>
                          {!groupedByPartner ? (
                              // Show individual contracts
                              contractsData.map((contract, index) => {
                                  const partnerName = partnersData.find(partner => partner.id === contract.partner)?.name || 'Unknown';
                                  return (
                                      <div key={index} style={styles.row}>
                                          <span style={styles.label}>Contract #{contract.id} with {partnerName}:</span>
                                          <span style={styles.value}>${contract.amount_paid}</span>
                                      </div>
                                  );
                              })
                          ) : (
                              // Show grouped contracts
                              groupedContractsData.map((group, index) => (
                                  <div key={index} style={styles.row}>
                                      <span style={styles.label}>{group.partnerName}:</span>
                                      <span style={styles.value}>${group.total}</span>
                                  </div>
                              ))
                          )}
                          <div style={styles.row}>
                              <span style={styles.label}>Total Earnings:</span>
                              <span style={styles.value}>${totalEarnings}</span>
                          </div>
                      </div>
                      {/* Additional Sections */}
                      <div className="d-flex flex-row text-white">
                          {/* Skill blocks can be dynamically rendered */}
                          {/* ... */}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}

export default UserProfilePage;
