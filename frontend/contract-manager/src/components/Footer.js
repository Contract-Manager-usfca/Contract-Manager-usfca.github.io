import React, { useState } from 'react';

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
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10 20px',
        backgroundColor: '#3E3E3E',
    },
    link: (isHovered) => ({
        color: isHovered ? '#9487E4' : 'white',
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
                {['Home', 'About Us', 'Help', 'Contact Us'].map((text) => (
                    <a key={text} href="#" style={styles.link(hoveredLink === text)}
                    onMouseEnter={() => setHoveredLink(text)}
                    onMouseLeave={() => setHoveredLink(null)}>
                    {text}
                    </a>
                ))}
            </div>
        </div>
    );
}
