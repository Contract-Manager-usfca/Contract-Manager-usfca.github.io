import React from 'react';
import Fade from 'react-reveal/Fade';
import usPhoto from '../imgs/aboutPhoto2.png';
import '../styles/basics.css';

// Inline CSS styling
const styles = {
  boldTextColor: {
    color: '#9C9FFB',
    fontWeight: "bold",
  },
};

function AboutUs() {
  return (
    <div className="basicsContainer">
      <Fade bottom>
        <main className="basicsMain">
          <header className="header">
            <h1>About Us</h1>
          </header>
          <section className="aboutSection">
            <h2 className="specialHeader">Our Story</h2>
            <p>
              &emsp;&emsp;We are a group of devoted individuals passionate about creating innovative and efficient software. Our team comprises highly skilled software engineers ready to put the word and time in. We take pride in our work and strive to deliver high-quality results. At our core, we believe in collaboration, communication, and creativity. Our team constantly learns and improves, and we take pride in adapting to new challenges and technologies.
              <br /><br />
              &emsp;&emsp;This project, <b style={styles.boldTextColor}>Zephyr</b>, is here to provide visibility and insight into the statistics of content creators with accessible ease. This platform is a multi-use tool used to give creators a place to view their earnings and see how they compare to others based on many demographic factors. We provide content for content creators.
            </p>
          </section>
          <section className="aboutSection">
            <h2 className="specialHeader">Our Team</h2>
            <p>
              Meet our passionate team of professionals, each bringing a unique set of skills and dedication to ensure the success of this project!
            </p>
            <img src={usPhoto} alt="team photos" className="aboutImg" />
          </section>
        </main>
      </Fade>
    </div>
  );
}

export default AboutUs;
