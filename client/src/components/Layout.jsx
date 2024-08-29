import { Row, Col, Button, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useLocation } from 'react-router-dom';

import { useEffect } from 'react';
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
      
    }
  }, [reloadFromServer]);
  
  return (      // mt-5 lo mette più in basso
    <>
      <div className="text-center mt-5">
        {props.loggedIn && (
          <>
            <div className="d-flex justify-content-between">
              <h1 className='my-2'>List of Reservations of {props.user.name}</h1>
            </div>
            <ReservationsTable 
              reservations={props.reservationList} />
          </>
          
        )}
      </div>
      
      
      <div className="flex-row justify-content-between mt-5">
        <h1 className='my-2'>List of Concerts</h1>
      </div>
      <ConcertsTable 
        concerts={props.concertList} loggedIn={props.loggedIn}
        expandedConcertID={props.expandedConcertID} 
        handleToggleSeats={props.handleToggleSeats}
        theater={props.theater} setTheater={props.setTheater}
        occupied={props.occupied} setOccupied={props.setOccupied}
        selectedSeats={props.selectedSeats} onSeatClick={props.onSeatClick} />
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

      <Row><Col>
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


export { GenericLayout, NotFoundLayout, LoginLayout, TableLayout };