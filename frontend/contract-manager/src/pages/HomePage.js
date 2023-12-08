import { useState, useEffect, useRef } from "react";
import BarGraph from "../components/BarGraph";
import StackedBarChart from "../components/StackedBarChart";
import BubbleChart from "../components/BubbleChart";
import axios from "axios";
import Fade from "react-reveal/Fade";
import loadingGif from "../imgs/loading2.gif";
import EarningsChart from "../components/Earnings";
import '../styles/homePage.css';

function HomePage() {
  // state setting 
  const [allDemographics, setAllDemographics] = useState([]);
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [partners, setPartners] = useState([]);
  const [averageDuration, setAverageDuration] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [demographicAverages, setDemographicAverages] = useState({});
  const [demographicCounts, setDemographicCounts] = useState({});
  const [searchMade, setSearchMade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoCategories, setSelectedDemoCategories] = useState(new Set());
  const prevSelectedDemosRef = useRef();
  const [contracts, setContracts] = useState([]);

  // Calling functions with user chosen demographic
  useEffect(() => {
    if (selectedDemographics.length > 0) {
      loadDemographicData(selectedDemographics);
      fetchFollowerCounts();
    }
  }, [selectedDemographics]);

  // Fetching and setting all available demographics from database for dropdown menu
  useEffect(() => {
    // Fetching demographics list
    axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
      .then(response => {
        // Grabbing Demographic name and its ID
        const demographicsArray = response.data.map(demographic => ({
          id: demographic.id,
          name: demographic.demographic,
        }));
        // Setting demographic state
        setAllDemographics(demographicsArray);
      })
      .catch((error) => {
        console.error("Error fetching demographics:", error);
      });
  }, []);

  // Fetching partner data
  useEffect(() => {
    setIsLoading(true);
    // Fetching partners list
    axios.get('https://contract-manager.aquaflare.io/partners/', { withCredentials: true })
      .then(response => {
        // Setting partner data
        setPartners(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching partners:", error);
        setIsLoading(false);
      });
  }, []);

  // Fetching contract data
  useEffect(() => {
    axios.get('https://contract-manager.aquaflare.io/contracts/')
      .then(response => {
        // Setting contract data
        setContracts(response.data);
      })
      .catch(error => {
        console.error("Error fetching contracts:", error);
      });
  }, []);

  // listening for changes in selectedDemographics
  useEffect(() => {
    const fetchData = async () => {
      if (selectedDemographics.length > 0) {
        setIsLoading(true);
        // Setting new selected demographic
        loadDemographicData(selectedDemographics);
        setIsLoading(false);
      }
    };
    // calling async function
    fetchData();
  }, [selectedDemographics]);


  // Function to fetch and set demographic data 
  const fetchDemographicData = () => {
    setIsLoading(true);

    // Fetching demographics list
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
            // Adding selected demographic to the state
            selectDemographic(demographicName);
          }
          // Clearing search query
          setSearchQuery("");
        }
      })
      .catch((error) => {
        console.error("Error fetching demographics:", error);
      });

    // Checking user selection
    if (searchQuery.toLowerCase() === "gender" || searchQuery.toLowerCase() === "race" || searchQuery.toLowerCase() === "sexuality" || searchQuery.toLowerCase() === "age" || searchQuery.toLowerCase() === "residence" || searchQuery.toLowerCase() === "language" || searchQuery.toLowerCase() === "genre") {
      // Clearing search query
      setSearchQuery("");
      setSearchMade(true);
      return;
    }
    setIsLoading(false);
  };

  // Function to fetch and set demographic data
  const loadDemographicData = async (selectedDemographics) => {
    setIsLoading(true);
    // Array used to store promises for fetching demographic data
    const fetchPromises = [];
    let userData = [];
    // Object used to store the counts for the current demographic
    const demographicCounts = {};

    // Iterating through selected demographics and fetch data for each one
    selectedDemographics.forEach((selectedDemo) => {
      // Finding corresponding demographic ID for the selected demographic
      const selectedDemoID = allDemographics.find((demo) => demo.name === selectedDemo)?.id;

      if (selectedDemoID) {
        // Fetching demo categories that have corresponding demographic ID
        fetchPromises.push(
          axios.get(`https://contract-manager.aquaflare.io/creator-demographics/?demographic=${selectedDemoID}`, { withCredentials: true })
            .then((response) => {
              const demoData = response.data;

              // Processing each demo and collect userData
              const filteredDemoData = demoData.filter((demo) => demo.demographic === selectedDemoID);
              filteredDemoData.forEach((demo) => {
                userData.push({ demographic: demo.demo, userID: demo.creator });
              });

              // Extracting and storing the categories in selectedDemoCategories
              const categories = filteredDemoData.map((demo) => demo.demo);

              // Creating a set to ensure only unique categories are added
              setSelectedDemoCategories(new Set());
              categories.forEach((category) => {
                setSelectedDemoCategories((prev) => new Set([...prev, category]));
              });

              // Count users in each demographic category
              filteredDemoData.forEach((demo) => {
                const category = demo.demo;

                if (category in demographicCounts) {
                  demographicCounts[category]++;
                } else {
                  demographicCounts[category] = 1;
                }
              });
            })
            .catch((error) => {
              console.error(`Error fetching ${selectedDemo} demographics:`, error);
            })
        );
      }
    });

    // Once all promises are resolved, isLoading is set to false because data is completely fetched
    Promise.all(fetchPromises)
      .then(() => {
        loadContractData(userData);
        fetchFollowerCounts(userData, demographicCounts);
        setIsLoading(false);
        return userData;
      })
      .catch((error) => {
        console.error("Error fetching demographic data:", error);
        setIsLoading(false);
      });
  };

  // Function to fetch and set average contract duration data
  const loadContractData = async (userData) => {
    try {
      // Fetching contract list
      const contractResponse = await axios.get('https://contract-manager.aquaflare.io/contracts/', { withCredentials: true });
      const allContracts = contractResponse.data;

      // Creating object to hold the sums and counts for averages later
      const sumsAndCounts = {};

      // Iterating over each contract fetch data points
      allContracts.forEach(contract => {
        const userID = contract.user;
        const partnerID = contract.partner;
        const partnerName = partners.find(p => p.id === partnerID).name;
        const userDemographic = userData.find(u => u.userID === userID)?.demographic;

        if (userDemographic) {
          // Initializing if not present
          if (!sumsAndCounts[userDemographic]) {
            sumsAndCounts[userDemographic] = {};
          }
          if (!sumsAndCounts[userDemographic][partnerName]) {
            sumsAndCounts[userDemographic][partnerName] = { sum: 0, count: 0 };
          }

          // Adding to sum and incrementing count
          const durationDays = (new Date(contract.end_date) - new Date(contract.start_date)) / (24 * 3600 * 1000);
          sumsAndCounts[userDemographic][partnerName].sum += durationDays;
          sumsAndCounts[userDemographic][partnerName].count += 1;
        }
      });

      // Calculating averages from sums and counts
      const averages = Object.keys(sumsAndCounts).map(demographic => {
        const partners = sumsAndCounts[demographic];
        const partnerAverages = Object.keys(partners).map(partner => {
          const { sum, count } = partners[partner];
          return { partner, averageDuration: count ? Math.round(sum / count) : 0 };
        });
        return { demographic, partners: partnerAverages };
      });

      // Updating state
      setAverageDuration(averages);

    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  // Function to fetch, set, and calculate average follower count data 
  const fetchFollowerCounts = (userData, demographicCounts) => {
    // Fetching creator platform list
    axios.get("https://contract-manager.aquaflare.io/creator-platforms/", { withCredentials: true })
      .then(response => {
        const followerData = response.data;
        // Object created to store the averages
        let categoryAverages = {};

        // Looping over each category in the demographicCounts
        Object.keys(demographicCounts).forEach(category => {
          const numberOfUsersInCategory = demographicCounts[category];
          let totalFollowerCount = 0;

          // Summing up follower count for each user in the category
          userData.forEach(user => {
            if (user.demographic === category) {
              // Getting all follower counts for this user across different platforms
              const userFollowerCounts = followerData.filter(follower => follower.creator === user.userID)
                .map(follower => follower.follower_count);
              // Summing up all follower counts for this user
              const userTotalFollowerCount = userFollowerCounts.reduce((sum, count) => sum + count, 0);
              // Adding this user's total follower count to the total for the category
              totalFollowerCount += userTotalFollowerCount;
            }
          });

          // Calculating the average follower count for the category
          categoryAverages[category] = numberOfUsersInCategory > 0 ? Math.round(totalFollowerCount / numberOfUsersInCategory) : 0;
        });

        // Setting the demographic counts
        setDemographicCounts(demographicCounts);
        // Setting the demographic averages
        setDemographicAverages(categoryAverages);

        // Timeout for loading 
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error fetching follower counts:", error);
      });
  };

  // Event handler for search change
  const handleDropdownChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function for managing the state related to selected demographics
  const selectDemographic = (demographic) => {
    // Checks if demographic is selected so the same demo isn't selected twice (counter measure)
    if (!selectedDemographics.includes(demographic)) {
      setSelectedDemographics((prev) => [...prev, demographic]);
    }
    // Setting selected demographic
    setSelectedDemographics([demographic]);
  };

  // Event handler for clearing searches
  const clearSelectedDemographics = () => {
    setSelectedDemographics([]);
    setSearchMade(false);
    setIsLoading(false);
    setSelectedDemoCategories(new Set());
  };

  // Event handler that listens for changes to demographic selection
  useEffect(() => {
    const prevSelectedDemos = prevSelectedDemosRef.current || [];
    if (selectedDemographics.length > prevSelectedDemos.length) {
      loadDemographicData(selectedDemographics);
    }
  }, [selectedDemographics]);

  // Function to render the aside content
  const renderAside = () => (
    <aside className="asideContainer">
      <div className="dropdown">
        <select onChange={handleDropdownChange} className="dropdownStyles" value={searchQuery}>
          <option value="">Select a Demographic</option>
          {/* Mapping demographics to display listen in dropdown */}
          {allDemographics.map((demographic) => (
            <option
              key={demographic.id}
              value={demographic.name}
              disabled={selectedDemographics.includes(demographic.name)}
            >
              {demographic.name}
            </option>
          ))}
        </select>
        {/* Fetches demographic data based on user selection */}
        <button onClick={fetchDemographicData} className="button">Select</button>
        {/* Clears demographic data */}
        <button onClick={clearSelectedDemographics} className="button">Clear</button>
      </div>
      {/* Calls function to render graphs */}
      {renderGraphs()}
    </aside>
  );

  // Function to render the main content
  const renderMainContent = () => (
    <main className="mainContent">
      <h1 style={{ color: 'white', fontSize: '30px', textAlign: 'center', paddingBottom: '2%' }}>General Statistics</h1>
      <div>
        <Fade bottom>
          <div className="chartContainer">
            <h2 className="chartTitle"><b>Contract Quantity Distribution Among Partners</b></h2>
            <Fade bottom>
              {/* First general statistic chart */}
              <BubbleChart />
            </Fade>
            <p className="chartText">
              <span>
                &emsp;&emsp;This bubble chart provides a visual representation of contract distributions among various partners. Each bubble corresponds to a single contract, and the clusters of bubbles illustrate the relative share of the total contract value associated with each partner.
              </span>
            </p>
          </div>

          <div className="chartContainer">
            <h2 className="chartTitle"><b>Content Creator Salary Distribution</b></h2>
            <Fade bottom>
              {/* Second general statistic chart */}
              <EarningsChart contracts={contracts} />
            </Fade>
            <p className="chartText">
              <span>
                &emsp;&emsp;This earnings chart provides a visual representation of salary distributions as a Content Creator.
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
        <div className="loadingCard">
          <Fade bottom>
            <div className="loadingTitle">
              <h2> Loading... </h2>
            </div>
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
            <div className="asideChartContainer">
              <h2 className="asideChartTitle">Average Follower Count</h2>
              <Fade bottom>
                {/* First aside content graph */}
                <BarGraph selectedDemoCategories={selectedDemoCategories}
                  demographicAverages={demographicAverages} />
              </Fade>
              <p className="asideChartText">
                <span>
                  &emsp;&emsp;The bar graph presents a comparison of average follower counts across various demographic segments. Each bar indicates the follower count for a specific demographic, providing a clear visual of comparative reach.
                </span>
              </p>
            </div>

            <div className="asideChartContainer">
              <h2 className="asideChartTitle">Average Contract Duration</h2>
              <Fade bottom>
                {/* Second aside content graph */}
                <StackedBarChart averageDuration={averageDuration} />
              </Fade>
              <p className="asideChartText">
                <span>
                  &emsp;&emsp;This stacked bar chart displays the average contract durations with key companies for the selected demographic groups. Each line corresponds to a demographic, allowing for a direct comparison of contract lengths.
                </span>
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
      {/* Calls to render entire home page */}
      {renderAside()}
      {renderMainContent()}
    </div>
  );
}
export default HomePage;