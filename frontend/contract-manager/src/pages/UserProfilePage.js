import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

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

    useEffect(() => {
        const fetchUserProfileAndDemographics = async () => {
            if (!isLoading && isAuthenticated && user) {
                try {
                    const userResponse = await axios.get(`https://contract-manager.aquaflare.io/creators/?username=${user.email}`, {
                        withCredentials: true,
                    });

                    const userProfile = userResponse.data.find(profile => profile.username === user.email);
                    if (userProfile) {
                        setProfileData(userProfile);

                        // Now fetch the demographics for this user
                        const demographicsResponse = await axios.get(`https://contract-manager.aquaflare.io/creator-demographics/?creator=${userProfile.id}`);
                        // Assuming the API returns an array of demographics for the specific user
                        setDemographicsData(demographicsResponse.data.filter(demo => demo.creator === userProfile.id));
                    } else {
                        console.log("Profile not found.");
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchUserProfileAndDemographics();
    }, [user, isAuthenticated, isLoading]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>User is not authenticated</div>;
    }

    return (
        <div style={styles.container}>
          {/* Profile section */}
          <div style={styles.section}>
            <h2 style={styles.header}>Profile</h2>
            <div style={styles.row}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{profileData?.name}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{profileData?.username}</span>
            </div>
            {/* Add more profile information here if available */}
          </div>
      
          {/* Demographics section */}
          <div style={styles.section}>
            <h2 style={styles.header}>Demographics</h2>
            {demographicsData.map((demo, index) => (
              <div key={index} style={styles.row}>
                {/* You would need a method to map demographic IDs to their names */}
                <span style={styles.label}>{/* Demographic name here */}:</span>
                <span style={styles.value}>{demo.demo}</span>
              </div>
            ))}
          </div>
      
          {/* Platforms section */}
          {/* If you have platforms data similar to demographics, you can follow a similar approach */}
          <div style={styles.section}>
            <h2 style={styles.header}>Platforms</h2>
            {/* Render platform information here if available */}
          </div>
      
          {/* Any additional sections can be added following the same pattern */}
        </div>
      );
}

export default UserProfilePage;
