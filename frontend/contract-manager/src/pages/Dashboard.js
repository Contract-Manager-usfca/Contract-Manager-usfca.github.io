import UserProfile from "../components/UserProfile";
import PlatformInput from "../components/PlatformInput";
import DemographicInput from "../components/DemographicInput";

function Dashboard() {
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
      <h3
        style={{
          backgroundColor: "#C188FB",
          textAlign: "center",
          fontSize: "50px",
        }}
      >
        {" "}
        Welcome!{" "}
      </h3>

      {/* Include the UserProfile component to display the user's name */}
      <UserProfile />
      <PlatformInput />
      <DemographicInput />
    </div>
  );
}

export default Dashboard;
