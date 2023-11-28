import { useState, useEffect, useRef } from "react";
import BarGraph from "../components/BarGraph";
import LollipopPlot from "../components/LollipopPlot";
import axios from "axios";
import Fade from "react-reveal/Fade";
import loadingGif from "../imgs/loading2.gif";

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

  const handleSearchChange = (e) => {
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


  function Chip({ label, onRemove }) {
    return (
      <div
        style={{
          display: "inline-flex",
          padding: "5px 10px",
          border: "1px solid #8CD5FF",
          borderRadius: "20px",
          marginRight: "10px",
          backgroundColor: "#303030",
        }}
      >
        <span>{label}</span>
        <button
          onClick={onRemove}
          style={{
            margin: "auto",
            cursor: "pointer",
            background: "none",
            border: "none",
            color: "#8CD5FF",
          }}
        >
          x
        </button>
      </div>
    );
  }

  const styles = {
    card: {
      display: "flex",
      alignItems: "center",
      margin: "20px 300px",
      textAlign: "center",
      borderRadius: "40%",
    },
    cardTitle: {
      color: "white",
      fontSize: '22px',
      paddingRight: "5%",
      paddingTop: "1%",
    },
    chartContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "70%",
      margin: "10px 250px 20px",
      backgroundColor: '#404040',
      borderRadius: '10px',
      padding: "20px",
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
      textAlign: "center",
    },
    searchBar: {
      display: "flex",
      gap: "10px",
      backgroundColor: "white",
      padding: ".5%",
      width: "500px",
    },
    searchInput: {
      padding: "5px",
      fontSize: "16px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      flexGrow: 1,
      textColor: "#292EB1",
    },
    searchBtn: {
      color: '#E3E4FF',
      padding: "5px 15px",
      fontSize: "16px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      backgroundColor: "#545AEC",
    },
    boldTextColor: {
      color: "#8CD5FF",
      fontWeight: "bold",
    },
    chipContainerStyle: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      margin: "auto",
      marginBottom: "15px",
      color: "white",
      marginTop: '10px',
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

  // Render the graphs only if a search has been made
  const renderGraphs = () => {
    if (isLoading) {
      return (
        <div style={styles.loadingCard}>
          <Fade bottom>
            <div style={styles.loadingTitle}>
              <h2> Loading... </h2>
            </div>x
            <img src={loadingGif} alt="Loading..." />
          </Fade>
        </div>
      );
    }
    if (searchMade && selectedDemoCategories.size > 0) {
      return (
        <div>
          <Fade bottom>
            <div style={styles.chartContainer}>
              <div style={styles.barGraph}>
                <h2 style={styles.chartTitle}>Average Follow Count</h2>
                <Fade bottom>
                  <BarGraph selectedDemoCategories={selectedDemoCategories}
                    demographicAverages={demographicAverages} />
                </Fade>
                <p style={styles.chartText}>
                  This is a <b>Bar Graph</b> generated with your selected
                  Demographics.
                  <br />
                  <br />
                  {selectedDemographics.length > 0 ? (
                    <span>
                      The Demographics currently selected are:&nbsp;
                      <span style={styles.boldTextColor}>
                        {selectedDemographics.join(", ")}
                      </span>
                    </span>
                  ) : (
                    <span style={styles.boldTextColor}>
                      Make a Selection above to see the generated results
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div style={styles.chartContainer}>
              <div className="first-graph-trigger">
                <div style={styles.barGraph}>
                  <h2 style={styles.chartTitle}>Average Follow Count</h2>
                  <Fade bottom>
                    <LollipopPlot selectedDemoCategories={selectedDemoCategories}
                    demographicAverages={demographicAverages} />
                  </Fade>
                  <p style={styles.chartText}>
                    This is a <b>Lollipop Plot Graph</b> generated with your
                    selected Demographics.
                    <br />
                    <br />
                    {selectedDemographics.length > 0 ? (
                      <span>
                        The Demographics currently selected are:&nbsp;
                        <span style={styles.boldTextColor}>
                          {selectedDemographics.join(", ")}
                        </span>
                      </span>
                    ) : (
                      <span style={styles.boldTextColor}>
                        Make a Selection above to see the generated results
                      </span>
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#252525",
        paddingBottom: "100px",
      }}
    >
      <Fade bottom>
        <div style={styles.card}>
          <h1 style={styles.cardTitle}>Search Demographic:</h1>
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
            Array.from(selectedDemoCategories).map((category, index) => (
              <Fade left key={index}>
                <Chip label={category} onRemove={() => deselectDemographic(category)} />
              </Fade>
            ))
          }
        </div>

      </Fade>
      {renderGraphs()}
    </div>
  );
}
export default HomePage;
