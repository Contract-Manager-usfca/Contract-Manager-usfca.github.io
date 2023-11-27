import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import '../styles/UserProfilePage.css';

const styles = {
    container: {
        color: '#CBE1AE',
        fontFamily: 'sans-serif',
        backgroundColor: '#202020',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 'auto',
        maxWidth: '950px',
        borderRadius: '5px',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    },
    section: {
        backgroundColor: '#333',
        margin: '20px 0',
        padding: '20px',
        borderRadius: '5px',
        width: '100%',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    },
    header: {
        color: '#9C9FFB',
        fontSize: '22px',
        borderBottom: 'none',
        paddingBottom: '10px',
        marginBottom: '20px',
    },
    name: {
        color: '#C1E9FF',
        fontSize: '2.5em',
        margin: '0% 0% 8% 15%',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        color: 'white',
    },
    label: {
        fontWeight: 'bold',
        color: '#CBE1AE',
    },
    subLabel: {
        color: 'white',
    },
    value: {
        color: 'white',
    },
    img: {
        width: '300px',
        height: 'auto',
        borderRadius: '5px',
    },
    socialIcon: {
        margin: 'auto',
        paddingLeft: '50%',
    },
    socialIconsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earningsCard: {
        backgroundColor: '#404040',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginTop: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        color: '#CBE1AE',
    },
    earningsHeader: {
        fontSize: '20px',
        color: 'white',
        marginBottom: '10px',
    },
    earningsAmount: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: 'white',
    },
    viewBtn: {
        fontSize: "18px",
    },
    viewBtn: (isHovered) => ({
        padding: '10px 20px',
        margin: '10px 0',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: isHovered ? '#8CD5FF' : '#545AEC',
        color: isHovered ? '#4775CD' : '#C1E9FF',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, color 0.3s ease',
    }),
};


function UserProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [profileData, setProfileData] = useState(null);
    const [demographicsData, setDemographicsData] = useState([]);
    const [contractsData, setContractsData] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [partnersData, setPartnersData] = useState([]);
    const [groupedByPartner, setGroupedByPartner] = useState(false);
    const [groupedContractsData, setGroupedContractsData] = useState([]);
    const [platformsData, setPlatformsData] = useState([]);
    const [userPlatformsData, setUserPlatformsData] = useState([]);
    // for hover effect
    const [isHovered, setIsHovered] = useState(false);


    // Dictionary to map platform names to icons and URL patterns
    const platformIcons = {
        'YouTube': { icon: 'fa fa-youtube', url: 'https://youtube.com/' },
        'Instagram': { icon: 'fa fa-instagram', url: 'https://instagram.com/' },
        'TikTok': { icon: 'fa fa-tiktok', url: 'https://tiktok.com/@' },
        'Twitter': { icon: 'fa fa-twitter', url: 'https://twitter.com/' }
        // Add more platforms as needed
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!isLoading && isAuthenticated && user) {
                try {
                    // Fetch user profile
                    const userResponse = await axios.get(`https://contract-manager.aquaflare.io/creators/?username=${user.email}`, {
                        withCredentials: true,
                    });
                    const userProfile = userResponse.data.find(profile => profile.username === user.email);
                    if (userProfile) {
                        setProfileData(userProfile);

                        // Fetch demographics
                        const demographicsResponse = await axios.get(`https://contract-manager.aquaflare.io/creator-demographics/?creator=${userProfile.id}`);
                        setDemographicsData(demographicsResponse.data.filter(demo => demo.creator === userProfile.id));

                        // Fetch contracts
                        const contractsResponse = await axios.get('https://contract-manager.aquaflare.io/contracts/');
                        const userContracts = contractsResponse.data.filter(contract => contract.user === userProfile.id);
                        setContractsData(userContracts);

                        // Calculate total earnings
                        setTotalEarnings(userContracts.reduce((acc, contract) => acc + contract.amount_paid, 0));

                        // Fetch partners
                        const partnersResponse = await axios.get('https://contract-manager.aquaflare.io/partners/');
                        setPartnersData(partnersResponse.data);

                        // Fetch platforms
                        const platformsResponse = await axios.get('https://contract-manager.aquaflare.io/platforms/');
                        setPlatformsData(platformsResponse.data);

                        // Fetch user's platforms
                        const userPlatformsResponse = await axios.get('https://contract-manager.aquaflare.io/creator-platforms/');
                        const userPlatforms = userPlatformsResponse.data.filter(platform => platform.creator === userProfile.id);
                        setUserPlatformsData(userPlatforms);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };


        fetchData();
    }, [user, isAuthenticated, isLoading]);

    // Function to group contracts by partner
    const groupContractsByPartner = () => {
        const groupedData = partnersData.map(partner => {
            const contracts = contractsData.filter(contract => contract.partner === partner.id);
            const total = contracts.reduce((acc, contract) => acc + contract.amount_paid, 0);
            return { partnerName: partner.name, total, contracts };
        }).filter(group => group.total > 0); // Filter out groups with 0 total earnings

        setGroupedContractsData(groupedData);
    };

    // Function to find platform name by ID
    const getPlatformName = (platformId) => {
        const platform = platformsData.find(p => p.id === platformId);
        return platform ? platform.name : 'Unknown';
    };

    // Toggle button handler
    const handleToggleGroupedView = () => {
        setGroupedByPartner(!groupedByPartner);
        if (!groupedByPartner) {
            groupContractsByPartner();
        }
    };

    // Function to generate social media links
    const generateSocialLinks = () => {
        return userPlatformsData.map(platform => {
            const platformInfo = platformIcons[getPlatformName(platform.platform)];
            if (platformInfo) {
                return (
                    <a key={platform.id} href={`${platformInfo.url}${platform.handle}`} target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className={`${platformInfo.icon}`}></i>
                    </a>
                );
            }
            return null;
        }).filter(link => link !== null); // Filter out null values
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>User is not authenticated</div>;
    }

    return (
        <div style={{ backgroundColor: "#252525" }}>
            <div style={styles.container}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}>
                    <img src="https://i.imgur.com/tdi3NGa.png" alt="Profile" style={styles.img} />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <h1 style={styles.name}>{profileData?.name}</h1>
                        <div>
                            <div style={styles.socialIconsContainer}>
                                {generateSocialLinks().map((icon, index) => (
                                    <span key={index} style={styles.socialIcon}>{icon}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={styles.section}>
                    <h1 style={styles.header}>Demographics:</h1>
                    {demographicsData.map((demo, index) => (
                        <div key={index} style={styles.row}>
                            <span style={styles.subLabel}>{demo.demo}</span>
                        </div>
                    ))}
                </div>
                <div style={styles.section}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h1 style={styles.header}>Contracts</h1>
                        <button onClick={handleToggleGroupedView}
                            style={styles.viewBtn(isHovered)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {groupedByPartner ? 'Show Individual' : 'Group by Partner'}
                        </button>
                    </div>
                    {!groupedByPartner ? (
                        // Show individual contracts
                        contractsData.map((contract, index) => {
                            const partnerName = partnersData.find(partner => partner.id === contract.partner)?.name || 'Unknown';
                            return (
                                <div key={index} style={styles.row}>
                                    <span style={styles.subLabel}>Contract #{contract.id} with {partnerName}:</span>
                                    <span style={styles.value}>${contract.amount_paid}</span>
                                </div>
                            );
                        })
                    ) : (
                        // Show grouped contracts
                        groupedContractsData.map((group, index) => (
                            <div key={index} style={styles.row}>
                                <span style={styles.subLabel}>{group.partnerName}:</span>
                                <span style={styles.value}>${group.total}</span>
                            </div>
                        ))
                    )}
                    <div style={styles.earningsCard}>
                        <div style={styles.earningsHeader}>Total Earnings</div>
                        <div style={styles.earningsAmount}>${totalEarnings}</div>
                    </div>
                </div>
                <div style={styles.section}>
                    <h1 style={styles.header}>Platforms</h1>
                    {userPlatformsData.map((platform, index) => (
                        <div key={index} style={styles.row}>
                            <span style={styles.subLabel}>{getPlatformName(platform.platform)}:</span>
                            <span style={styles.value}>{platform.handle} ({platform.follower_count} followers)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;
