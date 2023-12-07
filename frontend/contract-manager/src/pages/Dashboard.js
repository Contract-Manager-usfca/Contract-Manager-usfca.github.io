import UserProfile from "../components/UserProfile";
import PlatformInput from "../components/PlatformInput";
import DemographicInput from "../components/DemographicInput";
import ContractInput from "../components/ContractInput";
import Fade from 'react-reveal/Fade';
import '../styles/profile.css';


function Dashboard() {
  return (
    <div style={{ backgroundColor: "#252525" }}>
      <div className="container">
        <main>
          <header>
            <h1>Edit Profile</h1>
          </header>
          <Fade bottom>
            <section className="dashboardSection">
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

