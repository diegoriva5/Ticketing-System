import { Table, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TheaterSeats } from './TheaterSeats';

import API from '../API.js';

function ReservationsTable(props) {
  const { reservations, onDeleteReservation, user } = props;

  // Group reservations by concert_id
  const groupedReservations = {};

  reservations.forEach((reservation) => {
    const key = `${reservation.concert_id}`; // Unique key for each concert

    if (!groupedReservations[key]) {
      groupedReservations[key] = {
        concert_id: reservation.concert_id,
        concertName: reservation.concertName,
        theaterName: reservation.theaterName,
        seats: [],
      };
    }

    // Add seat to the group
    groupedReservations[key].seats.push(`${reservation.reservedRow}${reservation.reservedColumn}`);
  });

  // Convert groupedReservations object to an array for rendering
  const groupedReservationsArray = Object.values(groupedReservations);



  return (
      <Table className="table table-bordered table-striped table-hover w-100">
        <thead>
                <tr>
                    <th className="text-center">Concert</th>
                    <th className="text-center">Theater</th>
                    <th className="text-center">Seats</th>
                    <th className="text-center">Click to delete</th>
                </tr>
        </thead>
        <tbody>
          {groupedReservationsArray.map((group) => (
            <ReservationRow
              key={group.concert_id} // Unique key based on concert ID
              concertName={group.concertName}
              theaterName={group.theaterName}
              seats={group.seats}
              concertID={group.concert_id}
              onDeleteReservation={onDeleteReservation}
              expandedConcertID={props.expandedConcertID}
              setExpandedConcertID={props.setExpandedConcertID}
              user={user}
            />
          ))}
        </tbody>
      </Table>
  );
}

function ReservationRow(props) {
  const { concertName, theaterName, seats, concertID, onDeleteReservation, setExpandedConcertID, user } = props;

  const handleDeleteClick = () => {
    onDeleteReservation(concertID, user.id);
    setExpandedConcertID(null);
  };
 
  return (
    <tr>
      <td className="text-center">{concertName}</td>
      <td className="text-center">{theaterName}</td>
      <td className="text-center">{seats.join(', ')}</td>
      <td className="text-center">
        <i
          className="bi bi-trash"
          onClick={handleDeleteClick}
          style={{ cursor: 'pointer' }}
        ></i>
      </td>
    </tr>
  );
}

export { ReservationsTable };