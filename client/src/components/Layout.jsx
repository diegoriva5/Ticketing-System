import { Row, Col, Button, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import { LoginForm } from './Auth';
import { ConcertsTable } from './ConcertsLibrary';
import { ReservationsTable } from './ReservationTable.jsx';

import API from '../API.js';



function NotFoundLayout(props) {
  return (
    <>
      <h2>This route is not valid!</h2>
      <Link to="/">
        <Button variant="primary">Go back to the main page!</Button>
      </Link>
    </>
  );
}

function LoginLayout(props) {
  return (
    <>
      <Row>
        <Col>
          <LoginForm login={props.login} />
        </Col>
      </Row>
    </>
  );
}
  
function TableLayout(props) {
  // reloadTrigger: used to reload the list of the reservation of the user 
  // when the automatic booking is performed
  const location = useLocation();
  
  let reloadFromServer = true;
  if (location.state)
    reloadFromServer = location.state.reloadFromServer;  
  

  useEffect(() => {
    if (reloadFromServer) {
      API.getConcerts()
        .then(concerts => {
          props.setConcertList(concerts);
        })
        .catch(e => { 
          console.log(e); 
        }); 

      if(props.loggedIn){
        API.getReservationsOfUser(props.user.id)
        .then(reservations => {
          props.setReservationList(reservations);
        })
        .catch(e => {
          console.log(e);
        });
      }

      props.setReloadTrigger(false);
    }
  }, [reloadFromServer, props.reloadTrigger]);

  
  
  return (      // mt-5 lo mette più in basso
    <>
      <div className="text-center mt-5">
        {props.loggedIn && (
          <>
            <div className="flex-row justify-content-between text-success reservations-heading">
              <h1 className='my-3 mt-0'>Your reservations</h1>
            
              <ReservationsTable 
                reservations={props.reservationList}
                setReservations={props.setReservationList}
                onDeleteReservation={props.onDeleteReservation}
                expandedConcertID={props.expandedConcertID}
                setExpandedConcertID={props.setExpandedConcertID}
                user={props.user}
                authToken={props.authToken} setAuthToken={props.setAuthToken}
                discount={props.discount} setDiscount={props.setDiscount}
              />
             </div>
          </>
          
        )}
      </div>
      
      
      <div className="flex-row justify-content-between mt-2 concerts-heading">
        <h1 className='my-3 mt-0'>Next concerts</h1>
      
        <ConcertsTable 
          concerts={props.concertList} loggedIn={props.loggedIn}
          expandedConcertID={props.expandedConcertID} setExpandedConcertID={props.setExpandedConcertID}
          handleToggleSeats={props.handleToggleSeats}
          theater={props.theater} setTheater={props.setTheater}
          occupied={props.occupied} setOccupied={props.setOccupied}
          selectedSeats={props.selectedSeats} setSelectedSeats={props.setSelectedSeats}
          onSeatClick={props.onSeatClick}
          user={props.user}
          reloadTrigger={props.reloadTrigger}
          setReloadTrigger={props.setReloadTrigger}
          message={props.message} setMessage={props.setMessage}
          blueSeats={props.blueSeats} setBlueSeats={props.setBlueSeats} />
      </div>
    </>
  );
}

function ConfirmationLayout(props) {
  const { user, concertName, theaterName, selectedSeats, 
    setSelectedSeats, occupied, setOccupied, expandedConcertID, setExpandedConcertID,
    message, setMessage, reloadTrigger, setReloadTrigger,
    blueSeats, setBlueSeats } = props;

  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(true);


  // Simulate loading delay
  const simulateLoading = () => {
    setTimeout(() => {
      setLoading(false); // Update state to hide the loading message
    }, 2000); // 2-second delay
  };

  // Call simulateLoading immediately to start the timer
  if (loading) {
    simulateLoading();
  }

  const handleConfirmBooking = async () => {
    try {
      const bookingData = {
        concertID: expandedConcertID,
        seats: selectedSeats.map(seat => `${seat.row}${seat.column}`),
        userID: user.id
      };
  
      await API.confirmBooking(bookingData);
    
      alert('Booking confirmed!');
      setSelectedSeats([]); // Clear selected seats
      setExpandedConcertID(null);
      navigate('/'); // Navigate back to the home page or wherever you want after confirmation
    } catch (error) {
      alert('Error. The cause is displayed on top of the page.');
  
      // Fetch unavailable seats to determine which ones need to be displayed in blue
      const unavailableSeats = await API.checkSeatIsAvailable(expandedConcertID, selectedSeats);
      
      // Extract the rows and columns of unavailable seats
      const blueSeats = unavailableSeats.map(seat => `${seat.row}${seat.column}`);
      
  
      // Update state to display blue seats
      setBlueSeats(blueSeats);
  
      // Clear blueSeats state after 5 seconds
      setTimeout(() => {
        setBlueSeats([]); // Ensure this function is called to clear the state
      }, 7000);   /* 5000 + 2000 of loading */
  
      // Fetch reservations and update state
      API.getReservations(expandedConcertID)
        .then(reservations => {
          setOccupied(reservations);
          setSelectedSeats([]); // Clear selected seats after updating reservations
        })
        .catch(e => {
          console.error(e);
          setMessage(e.message);
        });
  
      // Update message with error information
      setMessage(error.message);
      navigate('/');
    }
  };

  const handleBack = () => {
    setSelectedSeats([]);
    setExpandedConcertID(null);
    navigate('/'); // Navigate back to the home page or wherever you want after confirmation
  };

  return (
    <>
      {loading ? ( // Show loading spinner if loading is true
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Processing confirmation...</span>
          </div>
        </div>
      ) : (
        <>
          <h2>Booking Confirmation</h2>
          <Row>
            <Col>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Concert:</strong> {concertName}</p>
              <p><strong>Theater:</strong> {theaterName}</p>
              <p><strong>Selected Seats:</strong> {selectedSeats.map(seat => `${seat.row}${seat.column}`).join(', ')}</p>
              <Button variant="success" onClick={handleConfirmBooking}>Confirm Booking</Button>
              <Button variant="danger" onClick={handleBack}>Back</Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
  
function GenericLayout(props) {
  return (
    <>
      <Row>
          <Col>
            <Navigation loggedIn={props.loggedIn} user={props.user} logout={props.logout} />
          </Col>
      </Row>

      <Row className='mt-5'><Col>
        {props.message? <Alert className='my-1' onClose={() => props.setMessage('')} variant='danger' dismissible>
          {props.message}</Alert> : null}
        {/* Alternative, with autohide
          <Toast show={props.message !== ''} onClose={() => props.setMessage('')} delay={4000} autohide>
            <Toast.Body>{props.message}</Toast.Body>
          </Toast>
        */}
      </Col></Row>

      <Row>
        <Col>
          <Outlet />
        </Col>
      </Row>
    </>
  );
}


export { GenericLayout, NotFoundLayout, LoginLayout, TableLayout, ConfirmationLayout };