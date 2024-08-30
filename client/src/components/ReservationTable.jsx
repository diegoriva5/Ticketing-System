import { Table, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { TheaterSeats } from './TheaterSeats';

import API from '../API.js';

function ReservationsTable(props) {
  const { reservations } = props;



  return (
      <Table className="table table-bordered table-striped table-hover w-100">
        <thead>
                <tr>
                    <th className="text-center">Concert</th>
                    <th className="text-center">Theater</th>
                    <th className="text-center">Seat</th>
                    <th className="text-center">Click to delete</th>
                </tr>
        </thead>
        <tbody>
            {reservations.map((reservation) => (
                <ReservationRow 
                    key={reservation.reservation_id} 
                    reservationData={reservation}
                    deleteReservation={props.deleteReservation} />
            ))}
        </tbody>
      </Table>
  );
}

function ReservationRow(props) {
  const { reservationData } = props;

  const handleDeleteClick = () => {
    props.deleteReservation(reservationData.reservation_id);
  };

  const seat = reservationData.reservedRow + reservationData.reservedColumn;
  /* Aggiungere l'onClick, e quindi l'onDelete al tasto per il delete (Lab10)*/ 
  return (
      <>
        <tr>
              <td>
                  <p>{reservationData.concertName}</p> 
              </td>
              <td>
                  <p>{reservationData.theaterName}</p>
              </td>
              <td>
                  <p>{seat}</p>
              </td>
              <td className="justify-content-center align-items-center">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <i className='bi bi-trash' onClick={handleDeleteClick}></i>
                </div>
              </td>
          </tr>
      </>
  );
}

export { ReservationsTable };