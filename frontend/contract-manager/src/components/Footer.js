import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../imgs/logo.png';

const styles = {
    container: {
        backgroundColor: '#111111',
        padding: '20px 0',
        position: 'static',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    footer: {
        maxWidth: '1200px',
        width: '75%',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        gap: '60px',
        padding: '10px 20px',
        backgroundColor: '#3E3E3E',
        fontFamily: 'Lora',
    },
    credits: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: '1%',
        color: 'white',
    },
    img: {
        height: 'auto',
        width: '35px',
      },
    link: (isHovered) => ({
        color: isHovered ? '#6394F1' : 'white',
        textDecoration: 'none',
        marginLeft: '20px',
        padding: '5px 10px',
        transition: 'background-color 0.3s ease, color 0.3s ease',
    }),
};

export default function Footer() {
    const [hoveredLink, setHoveredLink] = useState(null);

    return (
        <div style={styles.container}>
            <div style={styles.footer}>
                {/* Use the Link component to navigate to different routes */}
                <Link
                    to="/"
                    style={styles.link(hoveredLink === 'Home')}
                    onMouseEnter={() => setHoveredLink('Home')}
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    Home
                </Link>
                <Link
                    to="/AboutUs"
                    style={styles.link(hoveredLink === 'About Us')}
                    onMouseEnter={() => setHoveredLink('About Us')}
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    About Us
                </Link>
                <Link
                    to="/ContactUs"
                    style={styles.link(hoveredLink === 'Contact Us')}
                    onMouseEnter={() => setHoveredLink('Contact Us')}
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    Contact Us
                </Link>
            </div>
            <div style={styles.credits}>
                <p>&copy; 2023 Zephyr <img src={logo} alt="logo" style={styles.img} /> All rights reserved.</p>
            </div>
        </div>
    );
}