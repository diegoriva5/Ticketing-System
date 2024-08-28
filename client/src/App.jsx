import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { React, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Toast } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, useParams, Navigate, useNavigate } from 'react-router-dom';

import { GenericLayout, NotFoundLayout, LoginLayout, TableLayout } from './components/Layout';
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
        //handleError(err);
      }
    };
    checkAuth();
  }, []);  // The useEffect callback is called only the first time the component is mounted.

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
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
  const handleToggleSeats = (concertID) => {
    setExpandedConcertID(prevId => prevId === concertID ? null : concertID);
  };

  return (
    <Routes>
      <Route path="/" element={<GenericLayout 
                                  message={message} setMessage={setMessage}
                                  theater={theater} setTheater={setTheater}
                                  loggedIn={loggedIn} user={user} logout={handleLogout} />}>
          <Route index element={<TableLayout 
              concertList={concertList} setConcertList={setConcertList}
              loggedIn={loggedIn}
              expandedConcertID={expandedConcertID} setExpandedConcertID={setExpandedConcertID}
              handleToggleSeats={handleToggleSeats} />} />
          <Route path="/login" element={<LoginLayout login={handleLogin} />} />
          <Route path="*" element={<NotFoundLayout />} />
      </Route>
    </Routes>
  );
}

export default App
