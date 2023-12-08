import Fade from 'react-reveal/Fade';

function ContactUs() {

  return (
    <div className='basicsContainer'>
      <Fade bottom>
        <main className='basicsMain'>
          <header className="header">
            <h1>Contact Us</h1>
          </header>
          <section className='formSection'>
            {/* Form to user response */}
            <h2 className='specialh2'>Any Questions?</h2>
            <form className='form'>
              <input type="text" placeholder="Your Name" className='input' />
              <input type="email" placeholder="Your Email" className='input' />
              <textarea placeholder="Your Message" className='textbox'></textarea>
              <button
                type="submit" className='submitButton'>
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
