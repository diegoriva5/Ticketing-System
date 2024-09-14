import { Table, Card, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TheaterSeats } from './TheaterSeats';

import API from '../API.js';

function ReservationsTable(props) {
  const { reservations, onDeleteReservation, user, authToken } = props;


  // Group reservations by concert_id
  const groupedReservations = {};

  reservations.forEach((reservation) => {
    const key = `${reservation.concert_id}`; // Unique key for each concert

    if (!groupedReservations[key]) {
      groupedReservations[key] = {
        concert_id: reservation.concert_id,
        concertName: reservation.concertName,
        theaterName: reservation.theaterName,
        seats: []
      };
    }

    // Add seat to the group
    groupedReservations[key].seats.push(`${reservation.reservedRow}${reservation.reservedColumn}`);
  });

  // Convert groupedReservations object to an array for rendering
  const groupedReservationsArray = Object.values(groupedReservations);


  // If the user has some reservations, display them
  return (
    <>
      {reservations.length > 0 ? (
        <Table className="table table-bordered table-striped table-hover w-100 custom-table">
          <thead>
                  <tr>
                      <th className="text-center">Concert</th>
                      <th className="text-center">Theater</th>
                      <th className="text-center">Seats</th>
                      <th className="text-center bi bi-gift"> Discount</th>
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
                authToken={authToken}
                reservations={reservations}
              />
            ))}
          </tbody>
        </Table>
      ) : ( 
        <div>You don't have any active reservation!</div>
      )}

      {reservations.length > 0 && (
        <Card className="border-0 mb-4" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #4da65c 0%, #2575fc 100%)", color: "#fff", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
          <Card.Body className="p-4 text-center">
            <Card.Title className="mb-3" style={{ fontSize: "1.75rem", fontWeight: "700", letterSpacing: "1px" }}>🎉 Thanks for booking with us!</Card.Title>
            <div className="mb-4">
              <div style={{ fontWeight: "500", marginBottom: "15px", fontSize: "1.1rem" }}>
                Check out your discounts for the next concert's season!
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

function ReservationRow(props) {
  const { concertName, theaterName, seats, concertID, onDeleteReservation, setExpandedConcertID, user, authToken, reservations } = props;
  
  // Local state for managing the discount
  const [discount, setDiscount] = useState(0);

  // Function to calculate discount
  const calculateDiscount = async () => {
    if (authToken && Array.isArray(seats)) {
      const rows = seats.map((e) => parseInt(e[0], 10)); // Convert seat rows to numbers
      const sum = rows.reduce((accumulator, currentValue) => accumulator + currentValue, 0); // Calculate sum of rows
      
      try {
        const response = await API.getDiscount(authToken, sum, user.loyalty); // Fetch discount from the API
        return response.discount; // Return the computed discount
      } catch (err) {
        console.error('Error fetching discount:', err);
        return 0; // Return 0 if there is an error
      }
    }
    return 0; // Return 0 if authToken or seats is invalid
  };

  // Use useEffect to calculate the discount
  useEffect(() => {
    calculateDiscount().then(dis => setDiscount(dis));
  }, [authToken]); // Depends on authtoken, so I try to compute it less times

  const handleDeleteClick = () => {
    onDeleteReservation(concertID, user.id);
    setExpandedConcertID(null);   // when a reservation is deleted, close the seat maps
  };
 
  return (
    <tr>
      <td className="text-center">{concertName}</td>
      <td className="text-center">{theaterName}</td>
      <td className="text-center">{seats.join(', ')}</td>
      <td className="text-center">{discount}%</td>
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