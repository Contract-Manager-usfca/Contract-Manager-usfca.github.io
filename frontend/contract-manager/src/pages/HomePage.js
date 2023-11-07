import { useState, useEffect } from "react";
import BarGraph from "../components/BarGraph";
import LollipopPlot from "../components/LollipopPlot";
import axios from 'axios';
import Fade from 'react-reveal/Fade';

function HomePage() {
  const [allDemographics, setAllDemographics] = useState([]);
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [nonBinaryCount, setNonBinaryCount] = useState(0);
  const [genderAverages, setGenderAverages] = useState({});
  const [genderCounts, setGenderCounts] = useState({});
  const [searchMade, setSearchMade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  // targeted genders
  // need to figure out how to make this universal later
  const targetGenders = ['Male', 'Female', 'Nonbinary'];


  // Fetch and set all available demographics from database
  useEffect(() => {
    // Getting demographics list
    axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
      .then(response => {
        const demographicsArray = response.data.map(demographic => demographic.demographic);
        setAllDemographics(demographicsArray);
      })
      .catch(error => {
        console.error("Error fetching demographics:", error);
      });
  }, []);

  // WILL CHANGE 
  const fetchDemographic = () => {
    setIsLoading(true);
    console.log("loading..");
    if (searchQuery.toLowerCase() === "gender") {
      loadGenderData();
      setSearchQuery("");
      setSearchMade(true);
      // exit the function early if it's a gender search
      return;
    }
    setIsLoading(false);

    // FETCH DEMOGRAPHICS LIST
    axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
      .then(response => {
        const filteredData = response.data.filter(demographic => {
          return demographic.demographic.toLowerCase().includes(searchQuery.toLowerCase());
        });

        if (filteredData.length > 0) {
          const demographicName = filteredData[0].demographic;

          // checks to see if a demographic has already been selected
          // most likely will change because user shouldn't be able to 
          // select multiple demographics at the same time
          if (selectedDemographics.includes(demographicName)) {
            console.warn(`${demographicName} has already been selected!`);
            alert(`${demographicName} has already been selected!`);
          } else {
            selectDemographic(demographicName);
            setSearchQuery("");
          }
        } else {
          alert("Demographic not found!");
        }
      })
      .catch(error => {
        console.error("Error fetching demographics:", error);
      });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // FETCH GENDERS
  const loadGenderData = () => {
    // Check if gender data has already been loaded
    if (maleCount === 0 && femaleCount === 0 && nonBinaryCount === 0) {
      axios.get('https://contract-manager.aquaflare.io/creator-demographics/', { withCredentials: true })
        .then(response => {
          const genderDemos = response.data;
          const userData = [];
          let newMaleCount = 0;
          let newFemaleCount = 0;
          let newNonBinaryCount = 0;

          genderDemos.forEach(demo => {
            const gender = demo.demo;

            if (targetGenders.includes(gender)) {
              if (gender === "Male") {
                newMaleCount++;
              } else if (gender === "Female") {
                newFemaleCount++;
              } else if (gender === "Nonbinary") {
                newNonBinaryCount++;
              }
            }

            // push data to array
            userData.push({ demographic: gender, userID: demo.creator, });
          });

          setMaleCount(newMaleCount);
          setFemaleCount(newFemaleCount);
          setNonBinaryCount(newNonBinaryCount);
          setSelectedDemographics(targetGenders);

          // Fetch follower counts and calculate averages
          fetchFollowerCounts(userData);
        })
        .catch(error => {
          console.error("Error fetching creator demographics:", error);
          setIsLoading(false);
        });
    } else {
      // Gender data has already been loaded so don't fetch it again
      setSelectedDemographics(targetGenders);
      setIsLoading(false);
    }
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
        targetGenders.forEach(demographic => {
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
        setIsLoading(false);
        console.log("Not loading..");
      })
      .catch(error => {
        console.error("Error fetching follower counts:", error);
      });
  };

  const selectDemographic = (demographic) => {
    if (!selectedDemographics.includes(demographic)) {
      setSelectedDemographics(prev => [...prev, demographic]);
    }
  };

  const deselectDemographic = (demographic) => {
    if (targetGenders.includes(demographic)) {
      setSelectedDemographics(prev => prev.filter(item => item !== demographic));
    } else {
      setSelectedDemographics(prev => prev.filter(item => item !== demographic));
    }
  };

  const clearSelectedDemographics = () => {
    setSelectedDemographics([]);
    setSearchMade(false);
    setIsLoading(false); 
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
  };

  // Render the graphs only if a search has been made
  const renderGraphs = () => {
    if (isLoading) {
      return <div>Loading...</div>; // or any other loading indicator
    }
    if (searchMade && selectedDemographics.length > 0) {
      return (
        <div>
          <Fade bottom>
          <div style={styles.chartContainer}>
            <div style={styles.barGraph}>
              <h2 style={styles.chartTitle}>Average Follow Count</h2>
              {/* <Fade bottom> */}
              <BarGraph selectedDemographics={selectedDemographics} genderAverages={genderAverages}/>
              {/* </Fade> */}
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
                <LollipopPlot selectedDemographics={selectedDemographics} genderAverages={genderAverages}/>
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
          <button onClick={fetchDemographic} style={styles.searchBtn}>Search</button>
          <button onClick={clearSelectedDemographics} style={styles.searchBtn}>Clear</button>
        </div>
        {/* Create the datalist with all available demographics */}
        <datalist id="demographics-list">
          {allDemographics.map((option, index) => (
            <option key={index} value={option} />
          ))}
        </datalist>
      </div>
      </Fade>
      <Fade bottom>
      <div style={{ color: 'white', alignContent: 'center', margin: 'auto', marginBottom: '4px' }}>
        {selectedDemographics.map(demo => (
          <Chip key={demo} label={demo} onRemove={() => deselectDemographic(demo)} />
        ))}
      </div>
      </Fade>
      {renderGraphs()}
    </div>
  );
}
export default HomePage;
