import React, { useState, useEffect } from 'react';
import API from '../API';

function TheaterSeats({ theaterId }) {
  const [theater, setTheater] = useState(null);

  useEffect(() => {
    API.getTheater(theaterId).then(setTheater);
  }, [theaterId]);

  if (!theater) {
    return <p>Loading seats...</p>;
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
      <h4>{theater.name} Seats</h4>
      <div className="seat-grid">
        {seats}
      </div>
    </div>
  );
}

export { TheaterSeats };
