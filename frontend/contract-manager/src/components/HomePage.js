import { useState, useEffect } from "react";
import ScrollMagic from "scrollmagic";
// import "scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap";
// import { gsap } from 'gsap';
import BarGraph from "./BarGraph";
import LollipopPlot from "./LollipopPlot";
import axios from 'axios';

function HomePage() {
  const [allDemographics, setAllDemographics] = useState([]);
  const [selectedDemographics, setSelectedDemographics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch and set all available demographics from your database
  useEffect(() => {
    axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
      .then(response => {
        const demographicsArray = response.data.map(demographic => demographic.demographic);
        setAllDemographics(demographicsArray);
      })
      .catch(error => {
        console.error("Error fetching demographics:", error);
      });
    // Create a new ScrollMagic Controller
    const controller = new ScrollMagic.Controller();

    // Create a scene to trigger animations for the first graph
    new ScrollMagic.Scene({
      triggerElement: ".first-graph-trigger", // Replace with the appropriate trigger element
      triggerHook: 0.8, // Adjust the trigger hook as needed
    })
      .setClassToggle(".first-graph-trigger", "animated") // Toggle a CSS class on the trigger element
      .addTo(controller);

    // Create a scene to trigger animations for the second graph
    new ScrollMagic.Scene({
      triggerElement: ".second-graph-trigger", // Replace with the appropriate trigger element
      triggerHook: 0.8, // Adjust the trigger hook as needed
    })
      .setClassToggle(".second-graph-trigger", "animated") // Toggle a CSS class on the trigger element
      .addTo(controller);
  }, []);

  const fetchDemographic = () => {
    axios.get('https://contract-manager.aquaflare.io/demographics/', { withCredentials: true })
      .then(response => {
        const filteredData = response.data.filter(demographic => {
          return demographic.demographic.toLowerCase().includes(searchQuery.toLowerCase());
        });

        // Check If the filteredData contains results
        if (filteredData.length > 0) {
          const demographicName = filteredData[0].demographic;
          // Check if the demographic is already selected
          if (selectedDemographics.includes(demographicName)) {
            // Notify the user
            console.warn(`${demographicName} has already been selected!`);
            // Optionally, you can use an alert or other methods to notify the user
            alert(`${demographicName} has already been selected!`);
          } else {
            selectDemographic(demographicName);
            setSearchQuery("");
          }
        } else {
          // if demographic doesn't exist yet
          alert("Demographic not found!");
        }
      })
      .catch(error => {
        console.error("Error fetching demographics:", error);
      });
  };


  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const selectDemographic = (demographic) => {
    if (!selectedDemographics.includes(demographic)) {
      setSelectedDemographics(prev => [...prev, demographic]);
    }
  };

  const deselectDemographic = (demographic) => {
    setSelectedDemographics(prev => prev.filter(item => item !== demographic));
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
      margin: '20px 400px',
      textAlign: 'center',
      borderRadius: '40%',
    },
    cardTitle: {
      color: 'white',
      paddingRight: '10%',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#252525', paddingBottom: '100px' }}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Search Demographic</h2>
        <div style={styles.searchBar}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            list="demographics-list"
          />
          <button onClick={fetchDemographic} style={styles.searchBtn}>Search</button>
        </div>
        {/* Create the datalist with all available demographics */}
        <datalist id="demographics-list">
          {allDemographics.map((option, index) => (
            <option key={index} value={option} />
          ))}
        </datalist>
      </div>
      <div style={{ color: 'white', alignContent: 'center', margin: 'auto', marginBottom: '4px' }}>
        {selectedDemographics.map(demo => (
          <Chip key={demo} label={demo} onRemove={() => deselectDemographic(demo)} />
        ))}
      </div>
      <div style={styles.chartContainer}>
        <div style={styles.barGraph}>
          <h2 style={styles.chartTitle}>First D3 Graph</h2>
          <BarGraph selectedDemographics={selectedDemographics} />
          <p style={styles.chartText}>
            This is a <span style={styles.boldTextColor}>Bar Graph</span> generated with your selected Demographics.
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
            <h2 style={styles.chartTitle}>Second D3 Graph</h2>
            <LollipopPlot selectedDemographics={selectedDemographics} />
            <p style={styles.chartText}>
              This is a <span style={styles.boldTextColor}>Lollipop Plot Graph</span> generated with your selected Demographics.
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
    </div>
  );
}

export default HomePage;

