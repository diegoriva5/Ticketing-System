import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { React, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Toast } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { GenericLayout, NotFoundLayout, LoginLayout, TableLayout, ConfirmationLayout } from './components/Layout';
import API from './API.js';

function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}

function AppWithRouter(props) {

  const navigate = useNavigate();  // To be able to call useNavigate, the component must already be in BrowserRouter (see App)

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);
  // This state contains the list of concerts
  const [concertList, setConcertList] = useState([]);
  // This state contains the current theater info
  const [theater, setTheater] = useState(null);
  // This state contains the concertID of the concert which "Show seats" is clicked
  const [expandedConcertID, setExpandedConcertID] = useState(null);
  // This state contains the occupied seats of a specific concert (shown in red)
  const [occupied, setOccupied] = useState([]);
  // This state contains the conflictual seats (multi-user) that are shown for 5 seconds in blue
  const [blueSeats, setBlueSeats] = useState([]);
  // This state contains the selected seats
  const [selectedSeats, setSelectedSeats] = useState([]);
  // This state contains the reservation list of a specific user
  const [reservationList, setReservationList] = useState([]);
  
  // This state is used to reload some useEffect 
  const [reloadTrigger, setReloadTrigger] = useState(true); 
  // This state contains error messages that needs to be displayed
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(true);

  const [authToken, setAuthToken] = useState(undefined);

  // If an error occurs, the error message will be shown in a toast.
  const handleErrors = (err) => {
    console.log('DEBUG: err: '+JSON.stringify(err));
    let msg = '';
    if (err.error)
      msg = err.error;
    else if (err.errors) {
      if (err.errors[0].msg)
        msg = err.errors[0].msg + " : " + err.errors[0].path;
    } else if (Array.isArray(err))
      msg = err[0].msg + " : " + err[0].path;
    else if (typeof err === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg); // WARNING: a more complex application requires a queue of messages. In this example only the last error is shown.
    console.log(err);

    setTimeout( ()=> setDirty(true), 2000);
  }


  const renewToken = () => {
    API.getAuthToken().then((resp) => { setAuthToken(resp.token); } )
    .catch(err => {console.log("DEBUG: renewToken err: ",err)});
  }

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        API.getAuthToken().then((resp) => { setAuthToken(resp.token); })
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        // handleErrors(err);   ->  If you want to display the "Not authenticated" error message, 
        //                          even at the first loading of the page
      }
    };
    checkAuth();

  }, []);  // The useEffect callback is called only the first time the component is mounted.


  /**
   * This function handles the login process.
   */ 
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      renewToken();
      setExpandedConcertID(null);   // After the login, the page is displayed without any seat map
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
    setAuthToken(undefined);
    setExpandedConcertID(null);   // After the logout, the page is displayed without any seat map
    setMessage('');
    navigate("/");
  };

  /*
    When the user clicks the button, the handleToggleSeats function is called.
    It receives the concertID of the clicked concert. If the concertID matches
    the currently expandedConcertID, it means the map is already shown, so it 
    collapses the map by setting expandedConcertID to null. If it doesn’t match,
    it updates expandedConcertID to the clicked concertID to show the map.
  */
  const handleToggleSeats = async (concertID, theaterID) => {
    setExpandedConcertID(prevId => prevId === concertID ? null : concertID);   // This set is updated asynchronously, so the expandedConcertID will be still null when a seat map is opened
    if(expandedConcertID === concertID){  // So, if the state is still null it means that the button was clicked for the first time, and when expandedConcertID has a number it means that the seat map 
                                          // was already open and it needs to be collapsed
      // Collapse the map
      setTheater(null);
      setOccupied([]);
      setSelectedSeats([]);
    } else {    
      // Get info about the concertID
      try {
        const theaterInfo = await API.getTheaterInfo(theaterID);
        setTheater(theaterInfo);
        const reservationsInfo = await API.getReservations(concertID);
        setOccupied(reservationsInfo);
        setSelectedSeats([]);
      } catch (err) {
        handleErrors(err);
      }
    }
  };

  // Handle seat click for selecting/unselecting
  const handleSeatClick = (row, column) => {
    // It checks if the seat is occupied using the some method, which tests whether at least one element in the array passes the test
    const isOccupied = occupied.some(seat => seat.row === row && seat.column === column);

    if (isOccupied) {
      return; // Do nothing if the seat is occupied
    }

    // If the seat (row, column) passed as a parameter is not occupied, it creates a seat
    const seat = { row, column };

    // Now checks if the seat is already selected (yellow)
    const isSelected = selectedSeats.some(s => s.row === row && s.column === column);

    if (isSelected) {
      // Remove from selected if it's already selected
      setSelectedSeats(selectedSeats.filter(s => !(s.row === row && s.column === column)));
    } else {
      // Add to selected if it's not already selected
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleDeleteReservation = async (concertID, userID) => {
    try {
      await API.deleteReservationByID(concertID, userID); // A user can only have one reservation per concert, so every reservation of that concert coming from that user is deleted
      // Remove the reservation with the specified ID from the reservations array
      setReservationList(prevReservations => prevReservations.filter(reservation => reservation.concert_id !== concertID));
    } catch (err) {
      handleErrors(err);
    }
  }


  return (
    <Routes>
      <Route path="/" element={<GenericLayout 
                                  message={message} setMessage={setMessage}
                                  loggedIn={loggedIn} user={user} logout={handleLogout} />}>
          <Route index element={<TableLayout 
              message={message} setMessage={setMessage}
              concertList={concertList} setConcertList={setConcertList}
              loggedIn={loggedIn} user={user}
              expandedConcertID={expandedConcertID} setExpandedConcertID={setExpandedConcertID}
              handleToggleSeats={handleToggleSeats}
              theater={theater} setTheater={setTheater}
              occupied={occupied} setOccupied={setOccupied}
              selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats}
              onSeatClick={handleSeatClick}
              reservationList={reservationList} setReservationList={setReservationList}
              onDeleteReservation={handleDeleteReservation}
              blueSeats={blueSeats} setBlueSeats={setBlueSeats}
              reloadTrigger={reloadTrigger} setReloadTrigger={setReloadTrigger}
              authToken={authToken} setAuthToken={setAuthToken}
               />}/>
          <Route path="/login" element={<LoginLayout login={handleLogin} />} />
          <Route path="/confirmation" element={
            <ConfirmationLayout 
              user={user}
              concertName={concertList.find(concert => concert.id === expandedConcertID)?.name}
              theaterName={theater?.name}
              occupied={occupied} setOccupied={setOccupied}
              selectedSeats={selectedSeats} 
              setSelectedSeats={setSelectedSeats}
              expandedConcertID={expandedConcertID} 
              setExpandedConcertID={setExpandedConcertID}
              message={message} setMessage={setMessage}
              blueSeats={blueSeats} setBlueSeats={setBlueSeats}
            />
          } />
          <Route path="*" element={<NotFoundLayout />} />
      </Route>
    </Routes>
  );
}

export default App
