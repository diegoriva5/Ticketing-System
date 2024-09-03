import { Table, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TheaterSeats } from './TheaterSeats';

import API from '../API.js';

function ConcertsTable(props) {
  const { concerts, expandedConcertID, handleToggleSeats, 
    theater, occupied, setOccupied, selectedSeats, setSelectedSeats, 
    onSeatClick, setExpandedConcertID, user, reloadTrigger, setReloadTrigger,
    unavailableSeats, setUnavailableSeats, message, setMessage } = props;

  return (
      <Table className="table table-bordered table-striped table-hover w-100">
          <thead>
              <tr>
                  <th className="text-center">Concert</th>
                  <th className="text-center">Theater</th>
                  <th className="bi bi-ui-checks-grid"></th>
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
                      theater={theater}
                      occupied={occupied} setOccupied={setOccupied}
                      selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats}
                      onSeatClick={onSeatClick}
                      user={user}
                      expandedConcertID={expandedConcertID} setExpandedConcertID={setExpandedConcertID}
                      reloadTrigger={reloadTrigger}
                      setReloadTrigger={setReloadTrigger}
                      unavailableSeats={unavailableSeats} setUnavailableSeats={setUnavailableSeats}
                      message={message} setMessage={setMessage}
                  />
              ))}
          </tbody>
      </Table>
  );
}

function ConcertRow(props) {
  const { concertData, isExpanded, onToggleSeats, 
    loggedIn, theater, occupied, setOccupied, selectedSeats, 
    setSelectedSeats, onSeatClick, user, expandedConcertID, 
    setExpandedConcertID, reloadTrigger, setReloadTrigger,
    unavailableSeats, setUnavailableSeats, message, setMessage } = props;


  const toggleSeats = () => {   // Used to expand or collapse the 2D seat map
        onToggleSeats(concertData.id, concertData.theater_id);
        // Selects which row (controlled by the concert.id) needs to be expanded
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
                <Button variant="primary" onClick={toggleSeats}>
                    {isExpanded ? 'Hide seats ▲' : 'Show seats'}
                </Button>   
              </td>
          </tr>
          {isExpanded && theater && (
              <tr className="bg-danger text-white">
                  <td colSpan="3" className="text-center">
                      <TheaterSeats 
                        theater={theater} 
                        occupied={occupied} setOccupied={setOccupied}
                        selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats}
                        onSeatClick={onSeatClick}
                        loggedIn={loggedIn}
                        user={user}
                        expandedConcertID={expandedConcertID} setExpandedConcertID={setExpandedConcertID}
                        reloadTrigger={reloadTrigger} setReloadTrigger={setReloadTrigger}
                        unavailableSeats={unavailableSeats} setUnavailableSeats={setUnavailableSeats}
                        message={message} setMessage={setMessage}/>
                  </td>
                  
              </tr>
          )}
      </>
  );
}

export { ConcertsTable };