import { Table, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { TheaterSeats } from './TheaterSeats';

function ConcertsTable(props) {
  const { concerts, expandedConcertID, handleToggleSeats } = props;

  return (
      <Table className="table table-bordered table-striped table-hover w-100">
          <thead>
              <tr>
                  <th className="text-center">Concert</th>
                  <th className="text-center">Theater</th>
              </tr>
          </thead>
          <tbody>
              {concerts.map((concert) => (
                  <ConcertRow 
                      concertData={concert} 
                      key={concert.id}
                      isExpanded={expandedConcertID === concert.id} 
                      /*
                        If the expandedConcertID is equal to the concert.id, it 
                        means that isExpanded is TRUE, it means that the 2D map
                        is shown below.
                        If the expandedConcertID is NULL, it means that isExpanded
                        is FALSE, so the 2d map is not shown.
                      */
                      onToggleSeats={handleToggleSeats} 
                      loggedIn={props.loggedIn}
                  />
              ))}
          </tbody>
      </Table>
  );
}

function ConcertRow(props) {
  const { concertData, isExpanded, onToggleSeats, loggedIn } = props;

  const toggleSeats = () => {   // Used to expand or collapse the 2D seat map
      if(loggedIn){
        onToggleSeats(concertData.id);
        // Selects which row (controlled by the concert.id) needs to be expanded
      }
  };
  
  /*
    The row displays:
    - The concert name
    - The theater name
    - A button to book seats.
    
    If the user is logged in, clicking the button toggles the visibility of the 2D seat map.
    If the user is not logged in, clicking the button redirects to the login page.
    
    The map visibility is controlled by the isExpanded state, which determines if the map
    is shown underneath the row.
  */

  return (
      <>
          <tr>
              <td>
                  <p>{concertData.name}</p> 
              </td>
              <td>
                  <p>{concertData.theater_name}</p>
              </td>
              <td className="text-center">
                {loggedIn ? (
                    <Button variant="primary" onClick={toggleSeats}>
                        {isExpanded ? 'Hide seats ▲' : 'Book a seat'}
                    </Button>
                ) : (
                    <Link to="/login">
                        <Button variant="primary">Book a seat</Button>
                    </Link>
                )}
              </td>
          </tr>
          {isExpanded && (
              <tr className="bg-danger text-white">
                  <td colSpan="3" className="text-center">
                      <h1>{concertData.name} concert in {concertData.theater_name}</h1>
                      <hr />
                      <i>Tabella</i>
                  </td>
              </tr>
          )}
      </>
  );
}

export { ConcertsTable };