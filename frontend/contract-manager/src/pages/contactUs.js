import React, { useState } from 'react';
import Fade from 'react-reveal/Fade';

const styles = {
  container: {
    color: 'white',
    fontFamily: 'sans-serif',
    backgroundColor: 'rgb(37, 37, 37)',
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
    backgroundColor: 'rgb(37, 37, 37)',
    padding: '20px',
    borderRadius: '5px',
    minHeight: 'calc(100vh - 40px)',
  },
  aboutSection: {
    backgroundColor: '#404040',
    margin: '20px 0',
    padding: '20px',
    borderRadius: '5px',
    width: '50%',
  },
  h2: {
    fontSize: '23px',
    fontWeight: "bold",
    color: '#8CD5FF',
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
    cursor: 'pointer',
    justifyContent: 'end',
  },
  submitButton: (isHovered) => ({
    padding: '10px 20px',
    margin: '10px 0',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: isHovered ? '#545AEC' : '#8CD5FF',
    color: isHovered ? '#C1E9FF' : '#4775CD',
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
