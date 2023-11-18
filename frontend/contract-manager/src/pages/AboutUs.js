import React from 'react';
import Fade from 'react-reveal/Fade';
import usPhoto from '../imgs/aboutPhoto2.png';

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
              &emsp;&emsp;We are a group of devoted individuals passionate about <b>creating innovative and efficient software.</b> Our team comprises highly skilled software engineers ready to put the word and time in. We take pride in our work and strive to deliver high-quality results. At our core, we believe in collaboration, communication, and creativity. Our team constantly learns and improves, and we take pride in adapting to new challenges and technologies.
              <br /><br />
              &emsp;&emsp;This project, <b>Contract Manager</b>, is here to provide visibility and insight into the statistics of content creators with accessible ease. This platform is a multi-use tool used to give creators a place to view their earnings and see how they compare to others based on many demographic factors. We provide content for content creators.
            </p>
          </section>
          <section style={styles.aboutSection}>
            <h2 style={styles.h2}>Our Team</h2>
            <p>
              Meet our passionate team of professionals, each bringing <b>a unique set of skills and dedication</b> to ensure the success of this project!
            </p>
            <img src={usPhoto} alt="team" style={styles.img} />
          </section>
        </main>
      </Fade>
    </div>
  );
}

export default AboutUs;
