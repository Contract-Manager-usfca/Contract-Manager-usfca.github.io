import { useState, useEffect } from "react";
import BarGraph from "../components/BarGraph";
import LollipopPlot from "../components/LollipopPlot";
import axios from 'axios';
import Fade from 'react-reveal/Fade';
import loadingGif from '../imgs/loading2.gif';

function HomePage() {
  const [allDemographics, setAllDemographics] = useState([]);
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderAverages, setGenderAverages] = useState({});
  const [genderCounts, setGenderCounts] = useState({});
  const [searchMade, setSearchMade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch and set all available demographics from database
  useEffect(() => {
    // Getting demographics list
    axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
      .then(response => {
        // grabbing Demographic name and its ID
        const demographicsArray = response.data.map(demographic => ({
          id: demographic.id,
          name: demographic.demographic,
        }));
        setAllDemographics(demographicsArray);
      })
      .catch(error => {
        console.error("Error fetching demographics:", error);
      });
  }, []);


// Fetch data based on user input or selected demographics
const fetchDemographicData = () => {
  setIsLoading(true);
  console.log("loading..");

  // FETCH DEMOGRAPHICS LIST
  axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
    .then(response => {
      const filteredData = response.data.filter(demographic => {
        return demographic.demographic.toLowerCase().includes(searchQuery.toLowerCase());
      });

      if (filteredData.length > 0) {
        const demographicName = filteredData[0].demographic;

        // if (selectedDemographics.includes(demographicName)) {
        //   console.warn(`${demographicName} has already been selected!`);
        //   alert(`${demographicName} has already been selected!`);
        // } else {
          // Add the selected demographic to the state
          selectDemographic(demographicName);
          console.log('selected: ', selectedDemographics);
          // Clear the searchQuery
          setSearchQuery("");
          
          // Move loadDemographicData inside the .then block
          loadDemographicData(selectedDemographics);
        // }
      // } else {
      //   alert("Demographic not found!");
      }
    })
    .catch(error => {
      console.error("Error fetching demographics:", error);
    });

  // Check if the user input is "gender" or "race"
  if (searchQuery.toLowerCase() === "gender" || searchQuery.toLowerCase() === "race" || searchQuery.toLowerCase() === "sexuality" || searchQuery.toLowerCase() === "age" || searchQuery.toLowerCase() === "residence" || searchQuery.toLowerCase() === "language" || searchQuery.toLowerCase() === "genre") {
    // Clear the searchQuery
    setSearchQuery("");
    setSearchMade(true);
    return;
  }
  setIsLoading(false);
};

// Load demographic data function now accepts selectedDemographics as an argument
const loadDemographicData = (selectedDemographics) => {
  setIsLoading(true);
  // Create an array to store promises for fetching demographic data
  const fetchPromises = [];

  // Iterate through selected demographics and fetch data for each one
  selectedDemographics.forEach((selectedDemo) => {
    // Find the corresponding demographic ID for the selected demographic
    const selectedDemoID = allDemographics.find((demo) => demo.name === selectedDemo)?.id;
    console.log(selectedDemoID);
    if (selectedDemoID) {
      // Fetch demo categories that have the same demographic ID
      fetchPromises.push(
        axios.get(`https://contract-manager.aquaflare.io/creator-demographics/?demographic=${selectedDemoID}`, { withCredentials: true })
          .then((response) => {
            const demoData = response.data;
            console.log(demoData);

            // Filter demo data based on the matching demographic ID
            const filteredDemoData = demoData.filter((demo) => demo.demographic === selectedDemoID);

            // Initialize an object to store the counts for the current demographic
            const demographicCounts = {};

            // Count users in each demographic category
            filteredDemoData.forEach((demo) => {
              const category = demo.demo;
              console.log(category);

              if (category in demographicCounts) {
                demographicCounts[category]++;
              } else {
                demographicCounts[category] = 1;
              }
            });

            // Update your state or do other processing with the counts here
            console.log(`Counts for ${selectedDemo}:`, demographicCounts);
          })
          .catch((error) => {
            console.error(`Error fetching ${selectedDemo} demographics:`, error);
          })
      );
    }
  });

  // Once all promises are resolved, you can set isLoading to false
  Promise.all(fetchPromises)
    .then(() => {
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching demographic data:", error);
      setIsLoading(false);
    });
};


  // FETCHING FOLLOW COUNTS
  const fetchFollowerCounts = (userData) => {
    axios.get('https://contract-manager.aquaflare.io/creator-platforms/', { withCredentials: true })
      .then(response => {
        const followerData = response.data;
        const followerCounts = {};

        followerData.forEach(user => {
          const userID = user.creator;
          const followerCount = user.follower_count;

          if (userID in followerCounts) {
            followerCounts[userID] += followerCount;
          } else {
            followerCounts[userID] = followerCount;
          }

          // Check the gender of the user and add the follower count to the respective gender count
          const gender = userData.find(u => u.userID === userID)?.demographic;
          if (gender) {
            if (!(gender in genderCounts)) {
              genderCounts[gender] = 0;
            }
            genderCounts[gender] += followerCount;
          }
        });

        // follower counts for each user 
        // THIS IS CORRECT
        // console.log("follwer counts: ", followerCounts);

        // gender-specific follower counts
        // THIS IS ALSO CORRECT
        // console.log("gender counts", genderCounts);
        setGenderCounts(genderCounts);

        // Calculating Average number of followers per gender
        selectedDemographics.forEach(demographic => {
          // grab total follower count for the current gender or else 0
          const totalFollowerCount = genderCounts[demographic] || 0;
          // grab number of users in the current gender group:
          const numberOfUsers = userData.filter(user => user.demographic === demographic).length;
          const average = numberOfUsers > 0 ? totalFollowerCount / numberOfUsers : 0;
          // set average
          genderAverages[demographic] = Math.round(average);
        });
        console.log("GAaaaas:", genderAverages);
        setGenderAverages(genderAverages);
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
        // setIsLoading(false);
        console.log("Not loading..");
      })
      .catch(error => {
        console.error("Error fetching follower counts:", error);
      });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const selectDemographic = (demographic) => {
    if (!selectedDemographics.includes(demographic)) {
      setSelectedDemographics(prev => [...prev, demographic]);
    }
  };

  const deselectDemographic = (demographic) => {
    if (selectedDemographics.includes(demographic)) {
      setSelectedDemographics(prev => prev.filter(item => item !== demographic));
    } else {
      setSelectedDemographics(prev => prev.filter(item => item !== demographic));
    }
  };

  const clearSelectedDemographics = () => {
    setSelectedDemographics([]);
    setSearchMade(false);
    setIsLoading(false);
    console.log("50");
  };

  function Chip({ label, onRemove }) {
    return (
      <div style={{ display: 'inline-flex', padding: '5px 10px', border: '1px solid #9487E4', borderRadius: '20px', marginRight: '10px', backgroundColor: '#303030' }}>
        <span>{label}</span>
        <button onClick={onRemove} style={{ margin: 'auto', cursor: 'pointer', background: 'none', border: 'none', color: '#9487E4' }}>x</button>
      </div>
    );
  }

  const styles = {
    card: {
      display: 'flex',
      alignItems: 'center',
      margin: '20px 300px',
      textAlign: 'center',
      borderRadius: '40%',
    },
    cardTitle: {
      color: 'white',
      paddingRight: '5%',
      paddingTop: '1.5%',
    },
    chartContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '70%',
      margin: '10px 250px 20px',
      background: '#202020',
      padding: '20px',
      border: 'solid #CBE1AE 1px',
    },
    chartTitle: {
      color: 'white',
      marginBottom: '20px',
      textAlign: 'center',
      fontSize: '25px',
      color: '#C188FB'
    },
    chartText: {
      color: 'white',
      maxWidth: '100%',
      fontSize: '17px',
      marginTop: '20px',
      textAlign: 'center',
    },
    searchBar: {
      display: 'flex',
      gap: '10px',
      backgroundColor: 'white',
      padding: '.5%',
      width: '500px',
    },
    searchInput: {
      padding: '5px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      flexGrow: 1,
      textColor: '#CBE1AE',
    },
    searchBtn: {
      padding: '5px 15px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#CBE1AE',
    },
    boldTextColor: {
      color: '#C188FB',
      fontWeight: 'bold'
    },
    chipContainerStyle: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 'auto',
      marginBottom: '10px',
      color: 'white'
    },
    loadingTitle: {
      color: 'white',
      paddingRight: '5%',
      paddingTop: '1.5%',
    },
    loadingCard: {
      display: 'flex',
      alignItems: 'center',
      margin: 'auto',
      textAlign: 'center',
    },
  };

  // Render the graphs only if a search has been made
  const renderGraphs = () => {
    if (isLoading) {
      return (
        <div style={styles.loadingCard}>
          <Fade bottom>
            <div style={styles.loadingTitle}>
              <h2> Loading... </h2>
            </div>
            <img src={loadingGif} alt="Loading..." />
          </Fade>
        </div>
      );
    }
    if (searchMade && selectedDemographics.length > 0) {
      return (
        <div>
          <Fade bottom>
            <div style={styles.chartContainer}>
              <div style={styles.barGraph}>
                <h2 style={styles.chartTitle}>Average Follow Count</h2>
                <Fade bottom>
                  <BarGraph selectedDemographics={selectedDemographics} genderAverages={genderAverages} />
                </Fade>
                <p style={styles.chartText}>
                  This is a <b>Bar Graph</b> generated with your selected Demographics.
                  <br /><br />
                  {selectedDemographics.length > 0 ? (
                    <span>
                      The Demographics currently selected are:&nbsp;
                      <span style={styles.boldTextColor}>{selectedDemographics.join(", ")}</span>
                    </span>
                  ) : (
                    <span style={styles.boldTextColor}>Make a Selection above to see the generated results</span>
                  )}
                </p>
              </div>
            </div>

            <div style={styles.chartContainer}>
              <div className="first-graph-trigger">
                <div style={styles.barGraph}>
                  <h2 style={styles.chartTitle}>Average Follow Count</h2>
                  <Fade bottom>
                    <LollipopPlot selectedDemographics={selectedDemographics} genderAverages={genderAverages} />
                  </Fade>
                  <p style={styles.chartText}>
                    This is a <b>Lollipop Plot Graph</b> generated with your selected Demographics.
                    <br /><br />
                    {selectedDemographics.length > 0 ? (
                      <span>
                        The Demographics currently selected are:&nbsp;
                        <span style={styles.boldTextColor}>{selectedDemographics.join(", ")}</span>
                      </span>
                    ) : (
                      <span style={styles.boldTextColor}>Make a Selection above to see the generated results</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#252525', paddingBottom: '100px' }}>
      <Fade bottom>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Search Demographic</h2>
          <div style={styles.searchBar}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              list="demographics-list"
            />
            <button onClick={fetchDemographicData} style={styles.searchBtn}>Search</button>
            <button onClick={clearSelectedDemographics} style={styles.searchBtn}>Clear</button>
          </div>
          {/* Create the datalist with all available demographics */}
          <datalist id="demographics-list">
            {allDemographics.map((option) => (
              <option key={option.id} value={option.name} />
            ))}
          </datalist>
        </div>
      </Fade>
      <Fade bottom>
        <div style={styles.chipContainerStyle}>
          {!isLoading &&
            selectedDemographics.map((demo, index) => (
              <Fade left key={index}>
                <Chip label={demo} onRemove={() => deselectDemographic(demo)} />
              </Fade>
            ))}
        </div>

      </Fade>
      {renderGraphs()}
    </div>
  );
}
export default HomePage;