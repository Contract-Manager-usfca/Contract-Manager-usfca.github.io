import { useState, useEffect, useRef } from "react";
import BarGraph from "../components/BarGraph";
import LollipopPlot from "../components/LollipopPlot";
import axios from "axios";
import Fade from "react-reveal/Fade";
import loadingGif from "../imgs/loading2.gif";
import '../styles/homePage.css';
import BubbleChart from "../components/BubbleChart";

function HomePage() {
  const [allDemographics, setAllDemographics] = useState([]);
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [demographicAverages, setDemographicAverages] = useState({});
  const [demographicCounts, setDemographicCounts] = useState({});
  const [searchMade, setSearchMade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoCategories, setSelectedDemoCategories] = useState(new Set());
  const prevSelectedDemosRef = useRef();


  useEffect(() => {
    prevSelectedDemosRef.current = selectedDemographics;
  }, [selectedDemographics]);

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
      .catch((error) => {
        console.error("Error fetching demographics:", error);
      });
  }, []);


  // Add a new useEffect to listen for changes in selectedDemographics
  useEffect(() => {
    if (selectedDemographics.length > 0) {
      loadDemographicData(selectedDemographics);
      fetchFollowerCounts();
    }
  }, [selectedDemographics]);

  // Modify your fetchDemographicData function
  const fetchDemographicData = () => {
    setIsLoading(true);
    console.log("loading..");

    // FETCH DEMOGRAPHICS LIST
    axios
      .get("https://contract-manager.aquaflare.io/demographics/", {
        withCredentials: true,
      })
      .then((response) => {
        const filteredData = response.data.filter((demographic) => {
          return demographic.demographic
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

        if (filteredData.length > 0) {
          const demographicName = filteredData[0].demographic;

          if (!selectedDemographics.includes(demographicName)) {
            // Add the selected demographic to the state
            selectDemographic(demographicName);
          }
          console.log('selected: ', selectedDemographics);
          // Clear the searchQuery
          setSearchQuery("");

        }
      })
      .catch((error) => {
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

  // Load demographic data
  const loadDemographicData = (selectedDemographics) => {
    console.log("running...");
    setIsLoading(true);
    // array to store promises for fetching demographic data
    const fetchPromises = [];
    let userData = [];
    // object to store the counts for the current demographic
    const demographicCounts = {};

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

              // Process each demo and collect userData
              const filteredDemoData = demoData.filter((demo) => demo.demographic === selectedDemoID);
              filteredDemoData.forEach((demo) => {
                userData.push({ demographic: demo.demo, userID: demo.creator });
              });

              // Extract and store the categories in selectedDemoCategories
              const categories = filteredDemoData.map((demo) => demo.demo);

              // Use a Set to ensure only unique categories are added
              categories.forEach((category) => {
                setSelectedDemoCategories((prev) => new Set([...prev, category]));
              });

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
        console.log('demographic counts', demographicCounts);
        fetchFollowerCounts(userData, demographicCounts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching demographic data:", error);
        setIsLoading(false);
      });
  };

  const fetchFollowerCounts = (userData, demographicCounts) => {
    axios.get("https://contract-manager.aquaflare.io/creator-platforms/", { withCredentials: true })
      .then(response => {
        const followerData = response.data;
        let categoryAverages = {};

        // Loop over each category in the demographicCounts
        Object.keys(demographicCounts).forEach(category => {
          const numberOfUsersInCategory = demographicCounts[category];
          let totalFollowerCount = 0;

          // Sum up the follower count for each user in the category
          userData.forEach(user => {
            if (user.demographic === category) {
              // Get all follower counts for this user across different platforms
              const userFollowerCounts = followerData.filter(follower => follower.creator === user.userID)
                .map(follower => follower.follower_count);

              // Sum up all follower counts for this user
              const userTotalFollowerCount = userFollowerCounts.reduce((sum, count) => sum + count, 0);
              // Add this user's total follower count to the total for the category
              totalFollowerCount += userTotalFollowerCount;
            }
          });

          // Calculate the average follower count for the category
          categoryAverages[category] = numberOfUsersInCategory > 0 ? Math.round(totalFollowerCount / numberOfUsersInCategory) : 0;
        });

        setDemographicCounts(demographicCounts);
        setDemographicAverages(categoryAverages);

        console.log("Category counts:", demographicCounts);
        console.log("Category averages:", categoryAverages);

        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
        console.log("Completed fetching and calculating averages");
      })
      .catch((error) => {
        console.error("Error fetching follower counts:", error);
      });
  };

  const handleDropdownChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const selectDemographic = (demographic) => {
    if (!selectedDemographics.includes(demographic)) {
      setSelectedDemographics((prev) => [...prev, demographic]);
    }
  };

  const deselectDemographic = (demographic) => {
    setSelectedDemographics((prev) => prev.filter(item => item !== demographic));

    // Remove the deselected demographic from selectedDemoCategories
    setSelectedDemoCategories((prev) => {
      const updatedCategories = new Set(prev);
      updatedCategories.delete(demographic);
      return updatedCategories;
    });
  };

  const clearSelectedDemographics = () => {
    setSelectedDemographics([]);
    setSearchMade(false);
    setIsLoading(false);
    setSelectedDemoCategories(new Set());
  };

  useEffect(() => {
    const prevSelectedDemos = prevSelectedDemosRef.current || [];
    if (selectedDemographics.length > prevSelectedDemos.length) {
      loadDemographicData(selectedDemographics);
    }
  }, [selectedDemographics]);


  // for main content graphs
  const styles = {
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: '100%',
      padding: '20px',
      flexGrow: 1,
    },
    chartContainer: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#404040',
      borderRadius: '10px',
      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    },
    chartTitle: {
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "25px",
      color: "white",
    },
    chartText: {
      color: "white",
      maxWidth: "100%",
      fontSize: "17px",
      marginTop: "20px",
      textAlign: "left",
    },
  };


  // styles for aside
  const asideStyles = {
    container: {
      width: "40%",
      backgroundColor: "#303030",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
      flexGrow: 1,
    },
    chartContainer: {
      flexGrow: 1,
      width: '100%',
      maxWidth: '100%',
      justifyContent: 'space-between',
      overflow: 'hidden',
      backgroundColor: '#404040',
      borderRadius: '10px',
      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
      padding: '20px',
      marginBottom: '10%',
    },
    chartTitle: {
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "25px",
      color: "white",
    },
    chartText: {
      color: "white",
      maxWidth: "100%",
      fontSize: "15px",
      marginTop: "20px",
      textAlign: "left",
    },
    boldTextColor: {
      color: "#8CD5FF",
      fontWeight: "bold",
    },
    dropdown: {
      width: "100%",
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
    },
    dropdownStyles: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    searchInput: {
      flexGrow: 1,
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    button: {
      padding: "10px 15px",
      fontSize: "16px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      backgroundColor: "#545AEC",
      color: '#E3E4FF',
    },
    chipContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "10px",
      marginTop: '2%',
      marginBottom: "7%",
    },
    chip: {
      display: "inline-flex",
      padding: "5px 10px",
      border: "1px solid #8CD5FF",
      borderRadius: "20px",
      backgroundColor: "#303030",
      color: "white",
      cursor: "pointer",
    },
    loadingTitle: {
      color: "white",
      paddingRight: "5%",
      paddingTop: "1.5%",
    },
    loadingCard: {
      display: "flex",
      alignItems: "center",
      margin: "auto",
      textAlign: "center",
    },
  };

  // Function to render the aside content
  const renderAside = () => (
    <aside style={asideStyles.container}>
      <div style={asideStyles.dropdown}>
        <select onChange={handleDropdownChange} style={asideStyles.dropdownStyles} value={searchQuery}>
          <option value="">Select a Demographic</option>
          {allDemographics.map((demographic) => (
            <option key={demographic.id} value={demographic.name}>
              {demographic.name}
            </option>
          ))}
        </select>
        <button onClick={fetchDemographicData} style={asideStyles.button}>Select</button>
        <button onClick={clearSelectedDemographics} style={asideStyles.button}>Clear</button>
      </div>
      <div style={asideStyles.chipContainer}>
        {!isLoading &&
          Array.from(selectedDemoCategories).map((category, index) => (
            <Fade left key={index}>
              <div key={index} style={asideStyles.chip} onClick={() => deselectDemographic(category)}>
                {category} x
              </div>
            </Fade>
          ))
        }
      </div>
      {renderGraphs()}
    </aside>
  );

  // Function to render the main content
  const renderMainContent = () => (
    <main style={{ width: '60%', padding: '20px' }}>
      <h1 style={{ color: 'white', fontSize: '30px', textAlign: 'center', paddingBottom: '2%' }}>General Stats</h1>
      <div>
        <Fade bottom>
          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Graph #1</h2>
            <h3 style={styles.chartText}><b>will change once new graph is inputed</b></h3>
            <Fade bottom>
              <BarGraph style={styles.graph} selectedDemoCategories={selectedDemoCategories}
                demographicAverages={demographicAverages} />
            </Fade>
            <p style={styles.chartText}>
              <span>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. &nbsp;
              </span>
            </p>
          </div>

          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Graph #2</h2>
            <Fade bottom>
              <LollipopPlot selectedDemoCategories={selectedDemoCategories}
                demographicAverages={demographicAverages} />
            </Fade>
            <p style={styles.chartText}>
              <span>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. &nbsp;
              </span>
            </p>
          </div>
        </Fade>
         {/* New Bubble Chart Section */}
        <Fade bottom>
          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>Contract Distribution by Partner</h2>
            <Fade bottom>
              <BubbleChart />
            </Fade>
            <p style={styles.chartText}>
              <span>
                This bubble chart visualizes the distribution of contracts among partners. Each bubble's size represents the proportion of the total contract amount associated with that partner.
              </span>
            </p>
          </div>
        </Fade>
      </div>
    </main>
  );

  // Function to render graphs
  const renderGraphs = () => {
    // currently loading and waiting for data
    if (isLoading) {
      return (
        <div style={asideStyles.loadingCard}>
          <Fade bottom>
            <div style={asideStyles.loadingTitle}>
              <h2> Loading... </h2>
            </div>x
            <img src={loadingGif} alt="Loading..." />
          </Fade>
        </div>
      );
    }
    // if a search has been made render the graph
    if (searchMade && selectedDemoCategories.size > 0) {
      return (
        <div>
          <Fade bottom>
            <div style={asideStyles.chartContainer}>
              <h2 style={asideStyles.chartTitle}>Average Follow Count</h2>
              <Fade bottom>
                <BarGraph selectedDemoCategories={selectedDemoCategories}
                  demographicAverages={demographicAverages} />
              </Fade>
              <p style={asideStyles.chartText}>
                {selectedDemographics.length > 0 ? (
                  <span>
                    The Demographics currently selected are:&nbsp;
                    <span style={asideStyles.boldTextColor}>
                      {selectedDemographics.join(", ")}
                    </span>
                  </span>
                ) : (
                  <span style={asideStyles.boldTextColor}>
                    Make a Selection above to see the generated results
                  </span>
                )}
              </p>
            </div>

            <div style={asideStyles.chartContainer}>
              <h2 style={asideStyles.chartTitle}>Average Follow Count</h2>
              <Fade bottom>
                <LollipopPlot selectedDemoCategories={selectedDemoCategories}
                  demographicAverages={demographicAverages} />
              </Fade>
              <p style={asideStyles.chartText}>
                {/* check if demographic is selected */}
                {selectedDemographics.length > 0 ? (
                  <span>
                    The Demographics currently selected are:&nbsp;
                    <span style={asideStyles.boldTextColor}>
                      {selectedDemographics.join(", ")}
                    </span>
                  </span>
                ) : (
                  <span style={asideStyles.boldTextColor}>
                    Make a Selection above to see the generated results
                  </span>
                )}
              </p>
            </div>
          </Fade>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#252525" }}>
      {renderAside()}
      {renderMainContent()}
    </div>
  );
}
export default HomePage;