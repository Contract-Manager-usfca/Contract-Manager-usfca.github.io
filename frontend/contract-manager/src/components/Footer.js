import React from 'react';

const styles = {
    container: {
        backgroundColor: '#210043',
        padding: '20px 0',
        position: 'fixed',
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
        backgroundColor: 'white',
    },
    link: {
        color: '#C188FB',
        textDecoration: 'none',
        marginLeft: '20px',
        padding: '5px 10px',
        backgroundColor: 'white',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        '&:hover': {
            backgroundColor: '#C188FB',
            color: '#210043',
        }
    },
};

export default function Footer() {
    return (
        <div style={styles.container}>
            <div style={styles.footer}>
                <a href="#" style={styles.link}>Home</a>
                <a href="#" style={styles.link}>About Us</a>
                <a href="#" style={styles.link}>Help</a>
                <a href="#" style={styles.link}>Contact Us</a>
            </div>
        </div>
    );
}
