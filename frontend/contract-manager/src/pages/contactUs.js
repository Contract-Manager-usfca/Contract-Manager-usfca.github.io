import React, { useState } from 'react';
import Fade from 'react-reveal/Fade';

const styles = {
  container: {
    color: 'white',
    fontFamily: 'sans-serif',
    backgroundColor: '#333',
    minHeight: '80vh',
    padding: '20px',
  },
  header: {
    padding: '1%',
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
    fontSize: '22px',
    color: '#CBE1AE',
    marginLeft: '5%'
  },
  formSection: {
    backgroundColor: '#555',
    margin: '20px 0',
    padding: '20px',
    borderRadius: '5px',
    width: '50%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  textarea: {
    width: '90%',
    height: '100px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    resize: 'vertical',
  },
  submitButton: {
    padding: '10px 20px',
    margin: '10px 0',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#CBE1AE',
    color: '#64774B',
    cursor: 'pointer',
    justifyContent: 'end',
  },
  submitButton: (isHovered) => ({
    padding: '10px 20px',
    margin: '10px 0',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: isHovered ? '#889674' : '#CBE1AE',
    color: isHovered ? '#D0E5B5' : '#748063',
    cursor: 'pointer',
    justifyContent: 'end',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  }),
};

function ContactUs() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.container}>
      <Fade bottom>
        <main style={styles.main}>
          <header style={styles.header}>
            <h1>Contact Us</h1>
          </header>
          <section style={styles.formSection}>
            <h2 style={styles.h2}>Give us your feedback</h2>
            <form style={styles.form}>
              <input type="text" placeholder="Your Name" style={styles.input} />
              <input type="email" placeholder="Your Email" style={styles.input} />
              <textarea placeholder="Your Message" style={styles.textarea}></textarea>
              <button
                type="submit"
                style={styles.submitButton(isHovered)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Send Message
              </button>
            </form>
          </section>
        </main>
      </Fade>
    </div>
  );
}

export default ContactUs;
