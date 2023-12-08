import { Link } from 'react-router-dom';
import logo from '../imgs/logo.png';
import '../styles/basics.css';

export default function Footer() {

    // Function to scroll to the top of the page
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className='footerContainer'>
            <div className='footer'>
                {/* Link component used to navigate to different routes */}
                <Link to="/" onClick={scrollToTop} className='link'>
                    Home
                </Link>
                <Link to="/AboutUs" className='link'>
                    About Us
                </Link>
                <Link to="/ContactUs" className='link'>
                    Contact Us
                </Link>
            </div>
            {/* Team Credits */}
            <div className='credits'>
                <p>&copy; 2023 Zephyr <img src={logo} alt="logo" className='img' /> All rights reserved.</p>
            </div>
        </div>
    );
}