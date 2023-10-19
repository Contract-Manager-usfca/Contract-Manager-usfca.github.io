import { useState } from "react";
import LineChart from "./LineChart";
import { UserData } from "../Data";
import axios from 'axios';

function HomePage() {
  // graph tings
  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        label: "Users Gained",
        data: UserData.map((data) => data.userGain),
        backgroundColor: [
          "#03045E",
          "#003049",
          "#94D2BD",
          "#FdF0D5",
          "#C1121F",
        ],
        borderColor: [
          "#FFFBEE"
        ]
      },
    ],
  });

  const [users, setUsers] = useState([]);

  const fetchAllUsers = () => {
    // should be url to connect to back --> currently wrong
    axios.get('http://chupacabra.cs.usfca.edu:8000/creators/', { withCredentials: true })
      .then(response => {
        setUsers(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  };


  const styles = {
    card: {
      display: 'flex',
      alignItems: 'center',
      margin: '20px 400px',
      textAlign: 'center',
      borderRadius: '40%',
    },
    cardTitle: {
      color: 'white',
      paddingRight: '10%',
    },
    chart: {
      width: '100%',
      height: 'auto',
    },
    chartContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '70%',
      margin: '10px 250px 20px',
      background: '#202020',
      padding: '20px',
      border: 'solid #CBE1AE 1px'
    },
    chartTitle: {
      color: 'white',
      marginRight: '25px',
      marginBottom: '20px',
      padding: '2% 20% 0% 6%',
    },
    chartText: {
      color: 'white',
      marginRight: '20px',
      maxWidth: '70%',
      fontSize: '0.9rem',
      padding: '2% 0% 6% 6%',
    },
    searchBar: {
      display: 'flex',
      gap: '10px',
      backgroundColor: 'white',
      padding: '.5%',
      width: '500px'
    },
    searchInput: {
      padding: '5px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      flexGrow: 1,
      textColor: '#CBE1AE'
    },
    searchBtn: {
      padding: '5px 15px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#CBE1AE',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#252525', paddingBottom: '100px' }}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Search Users</h2>
        <div style={styles.searchBar}>
          <input type="text" style={styles.searchInput} placeholder="Search..." />
          <button onClick={fetchAllUsers} style={styles.searchBtn}>Search</button>
        </div>
      </div>
      <div style={{ color: 'white', alignContent: 'center', margin: 'auto'}}>
        {/* User Data Display */}
        {/* Map through users and grab their id and name*/}
        {users && users.length > 0 && (
          <div style={styles.userDataContainer}>
            <h2>Users:</h2>
            <ul>
              {users.map(user => (
                <li key={user.id} style={styles.userListItem}>
                  {user.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div style={styles.chartContainer}>
        <div>
          <h2 style={styles.chartTitle}>CHART 1</h2>
          <p style={styles.chartText}>
            These are the results from Chart 1. Demographic, blah blah, gets some percentage more followers than the other demographics. blah blah blah more explanation about this graph.
          </p>
        </div>
        <div style={styles.chart}>
          <LineChart chartData={userData} />
        </div>
      </div>
      <div style={styles.chartContainer}>
        <div style={styles.chart}>
          <LineChart chartData={userData} />
        </div>
        <div>
          <h2 style={styles.chartTitle}>CHART 2</h2>
          <p style={styles.chartText}>
            These are the results from Chart 2. Demographic, blah blah, gets some percentage more followers than the other demographics. blah blah blah more explanation about this graph.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

