import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import '../styles/profilePage.css';


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
            <div className='profileContainer'>
                <div className='specialSection'>
                    <img src="https://i.imgur.com/tdi3NGa.png" alt="Profile" className='profileImg' />
                    <div className='specialSubSection'>
                        <h1 className='name'>{profileData?.name}</h1>
                        <div>
                            <div className='socialIconsContainer'>
                                {generateSocialLinks().map((icon, index) => (
                                    <span key={index} className='socialIcon'>{icon}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='section'>
                    <h1 className='header'>Demographics:</h1>
                    {demographicsData.map((demo, index) => (
                        <div key={index} className='profileRow'>
                            <span className='subLabel'>{demo.demo}</span>
                        </div>
                    ))}
                </div>
                <div className='section'>
                    <div className='subSection'>
                        <h1 className='header'>Contracts</h1>
                        <button onClick={handleToggleGroupedView} className='viewBtn'>
                            {groupedByPartner ? 'Show Individual' : 'Group by Partner'}
                        </button>
                    </div>
                    {!groupedByPartner ? (
                        // Show individual contracts
                        contractsData.map((contract, index) => {
                            const partnerName = partnersData.find(partner => partner.id === contract.partner)?.name || 'Unknown';
                            return (
                                <div key={index} className='profileRow'>
                                    <span className='subLabel'>Contract #{contract.id} with {partnerName}:</span>
                                    <span className='profileValue'>${contract.amount_paid}</span>
                                </div>
                            );
                        })
                    ) : (
                        // Show grouped contracts
                        groupedContractsData.map((group, index) => (
                            <div key={index} className='profileRow'>
                                <span className='subLabel'>{group.partnerName}:</span>
                                <span className='profileValue'>${group.total}</span>
                            </div>
                        ))
                    )}
                    <div className='earningsCard'>
                        <div className='earningsHeader'>Total Earnings</div>
                        <div className='earningsAmount'>${totalEarnings}</div>
                    </div>
                </div>
                <div className='section'>
                    <h1 className='header'>Platforms</h1>
                    {userPlatformsData.map((platform, index) => (
                        <div key={index} className='profileRow'>
                            <span className='subLabel'>{getPlatformName(platform.platform)}:</span>
                            <span className='profileValue'>{platform.handle} ({platform.follower_count} followers)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;
