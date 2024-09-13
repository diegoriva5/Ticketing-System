import { Table, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TheaterSeats } from './TheaterSeats';

import API from '../API.js';

function ConcertsTable(props) {
  const { concerts, expandedConcertID, handleToggleSeats, 
    theater, occupied, setOccupied, selectedSeats, setSelectedSeats, 
    onSeatClick, setExpandedConcertID, user, reloadTrigger, setReloadTrigger,
    unavailableSeats, setUnavailableSeats, message, setMessage, 
    blueSeats, setBlueSeats } = props;

  return (
      <Table className="custom-concerts-table w-100">
          <thead className="bg-gradient text-white">
              <tr>
                  <th className="text-center align-middle">Concert</th>
                  <th className="text-center align-middle">Theater</th>
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
                      blueSeats={blueSeats} setBlueSeats={setBlueSeats}
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
    unavailableSeats, setUnavailableSeats, message, setMessage,
    blueSeats, setBlueSeats } = props;


  const toggleSeats = () => {   // Used to expand or collapse the 2D seat map
        onToggleSeats(concertData.id, concertData.theater_id);
        setMessage('');
        // Selects which row (controlled by the concert.id) needs to be expanded
  };
  
  /*
    The row displays:
    - The concert name
    - The theater name
    - A button to book seats.
    
    The map visibility is controlled by the isExpanded state, which determines if the map
    is shown underneath the row.
  */

  return (
      <>
            <tr className="bg-dark text-light custom-row" 
                style={{ transition: "background-color 0.3s ease" }} 
            >
              <td className="align-middle text-center">
                  <p className="m-0 font-weight-bold">{concertData.name}</p> 
              </td>
              <td className="align-middle text-center">
                  <p className="m-0">{concertData.theater_name}</p>
              </td>
              <td className="align-middle text-center">
                <Button 
                    variant="primary" 
                    onClick={toggleSeats} 
                    className="btn-lg" 
                    style={{ borderRadius: "30px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"}}
                >
                    {isExpanded ? 'Hide seats ▲' : 'Show seats'}
                </Button>   
              </td>
          </tr>
          {isExpanded && theater && (
              <tr>
                    <td colSpan="3" className="text-center p-3 custom-gradient-background" 
                        style={{ background: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)" }}>
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
                                message={message} setMessage={setMessage}
                                blueSeats={blueSeats} setBlueSeats={setBlueSeats} />
                    </td>
                  
              </tr>
          )}
      </>
  );
}

export { ConcertsTable };