import UserProfile from "../components/UserProfile";
import PlatformInput from "../components/PlatformInput";
import DemographicInput from "../components/DemographicInput";
import ContractInput from "../components/ContractInput";
import Fade from 'react-reveal/Fade';

// Reuse the styles from AboutUs for consistency
const styles = {
  container: {
    color: 'white',
    fontFamily: 'Ubuntu',
    backgroundColor: '#333',
    minHeight: '100vh',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '5px',
    minHeight: 'calc(100vh - 40px)',
  },
  dashboardSection: {
    backgroundColor: '#444',
    borderRadius: '5px',
    width: '75%',
  },
  h1: {
    paddingBottom: '10px',
    textAlign: 'center',
  },
};

function Dashboard() {
  return (
    <div style={styles.container}>
      <Fade bottom>
        <main style={styles.main}>
          <header style={styles.header}>
            <h1>Edit Profile</h1>
          </header>
            <section style={styles.dashboardSection}>
            <UserProfile />
            <PlatformInput />
            <DemographicInput />
            <ContractInput />
            </section>
        </main>
      </Fade>
    </div>
  );
}

export default Dashboard;

