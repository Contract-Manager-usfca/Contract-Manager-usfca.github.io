import UserProfile from "../components/UserProfile";
import PlatformInput from "../components/PlatformInput";
import DemographicInput from "../components/DemographicInput";
import ContractInput from "../components/ContractInput";
import Fade from 'react-reveal/Fade';

const styles = {
  container: {
    color: 'white',
    fontFamily: 'Ubuntu',
    minHeight: '100vh',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#222222',
    padding: '20px',
    borderRadius: '5px',
    minHeight: 'calc(100vh - 40px)',
  },
  dashboardSection: {
    borderTop: 'solid 1px #CBE1AE',
    backgroundColor: '#404040',
    borderRadius: '5px',
    width: '75%',
    marginBottom: '2%',
  },
  h1: {
    paddingBottom: '10px',
    textAlign: 'center',
  },
};

function Dashboard() {
  return (
    <div style={{ backgroundColor: "#252525" }}>
      <div style={styles.container}>
        <main style={styles.main}>
          <header style={styles.header}>
            <h1>Edit Profile</h1>
          </header>
          <Fade bottom>
            <section style={styles.dashboardSection}>
              <UserProfile />
              <PlatformInput />
              <DemographicInput />
              <ContractInput />
            </section>
          </Fade>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

