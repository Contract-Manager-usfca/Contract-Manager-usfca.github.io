import decode from 'jwt-decode';

class AuthService {
  //decodes token if there is one
  getProfile() {
    return decode(this.getToken());
  }
// if they are logged returns token if theyre logged in and their session has not expired 
  loggedIn() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token) ? true : false;
  }
//function to check if token is expired
  isTokenExpired(token) {
//decodes token then compares to local machine time, if its less removes token from local storage and returns true
    const decoded = decode(token);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('id_token');
      return true;
    }

    return false;
  }
//gets token from local storage
  getToken() {
    return localStorage.getItem('id_token');
  }
//sets token on login to local storage and redirects to homepage
  login(idToken) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }
//takes out token if they log out
  logout() {
    localStorage.removeItem('id_token');
    window.location.reload();
  }
}

export default new AuthService();