import React from 'react';
import Fade from 'react-reveal/Fade';
import usPhoto from '../imgs/aboutPhoto.png';

const styles = {
  container: {
    color: 'white',
    fontFamily: 'sans-serif',
    backgroundColor: '#333',
    minHeight: '100vh',
    padding: '20px',
  },
  header: {
    padding: '1% 0',
    textAlign: 'center',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '5px',
    minHeight: 'calc(100vh - 40px)',
  },  
  aboutSection: {
    backgroundColor: '#444',
    margin: '20px 0',
    padding: '20px',
    borderRadius: '5px',
    width: '50%',
  },  
  h2: {
    paddingBottom: '10px',
    color: '#CBE1AE',
    marginLeft: '5%'
  },
  footer: {
    backgroundColor: '#222',
    color: 'white',
    textAlign: 'center',
    padding: '10px 0',
    position: 'absolute',
    bottom: '0',
    width: '100%'
  },
  img: {
    maxWidth: "600px",
    maxHeight: "300px",
    width: "100%",
    height: "auto",
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
};


function AboutUs() {
  return (
    <div style={styles.container}>
      <Fade bottom>
      <main style={styles.main}>
        <header style={styles.header}>
          <h1>About Us</h1>
        </header>
          <section style={styles.aboutSection}>
            <h2 style={styles.h2}>Our Story</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut augue congue ultrices. Vivamus at sapien in sapien lobortis hendrerit. Nulla facilisi. Fusce commodo, odio a condimentum imperdiet, metus felis fringilla odio, in vulputate mi leo id ex.
            </p>
          </section>
          <section style={styles.aboutSection}>
            <h2 style={styles.h2}>Our Team</h2>
            <p>
              Meet our dedicated team of professionals who are working their asses off to make this project fireeeeee!
            </p>
            <img src={usPhoto} alt="team" style={styles.img} />
          </section>
        </main>
      </Fade>
    </div>
  );
}

export default AboutUs;
