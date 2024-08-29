import React, { useState, useEffect } from 'react';
import API from '../API';

function TheaterSeats(props) {
  const { theater } = props;

  if (!theater) {
    return <p>Loading theater information...</p>;
  }

  const seats = Array.from({ length: theater.rows }, (_, rowIndex) =>
    Array.from({ length: theater.columns }, (_, colIndex) => (
      <div key={`${rowIndex}-${colIndex}`} className="seat">
        {`${rowIndex + 1}${String.fromCharCode(65 + colIndex)}`}
      </div>
    ))
  );

  return (
    <div className="theater-seats">
      <div className="stage">Stage</div>
      <h4>{theater.name} Seats</h4>
      <div className="seat-grid">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat) => seat)}
          </div>
        ))}
      </div>
      <hr />
      <i>Total seats: {theater.seats}</i>
    </div>
  );
}

export { TheaterSeats };
