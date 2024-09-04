import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { React, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Toast } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, useParams, Navigate, useNavigate } from 'react-router-dom';

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
  const [concertList, setConcertList] = useState([]);
  const [theater, setTheater] = useState(null);
  const [expandedConcertID, setExpandedConcertID] = useState(null);
  const [occupied, setOccupied] = useState([]);
  const [blueSeats, setBlueSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservationList, setReservationList] = useState([]);

  const [reloadTrigger, setReloadTrigger] = useState(true); 
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(true);

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

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        // handleError(err);
      }
    };
    checkAuth();
  }, []);  // The useEffect callback is called only the first time the component is mounted.

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setExpandedConcertID(null);
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
    setExpandedConcertID(null);
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
    setExpandedConcertID(prevId => prevId === concertID ? null : concertID);
    if(expandedConcertID === concertID){
      setTheater(null);
      setOccupied([]);
      setSelectedSeats([]);
    } else {
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
    const isOccupied = occupied.some(seat => seat.row === row && seat.column === column);

    if (isOccupied) {
      return; // Do nothing if the seat is occupied
    }

    const seat = { row, column };
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
      await API.deleteReservationByID(concertID, userID);
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

              reloadTrigger={reloadTrigger} setReloadTrigger={setReloadTrigger}
            />
          } />
          <Route path="*" element={<NotFoundLayout />} />
      </Route>
    </Routes>
  );
}

export default App
