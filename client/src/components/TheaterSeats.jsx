import React from 'react';
import '../App.css'; // Ensure CSS is imported

function TheaterSeats(props) {
  const { theater, occupied } = props;

  if (!theater) {
    return <p>Loading theater information...</p>;
  }

  // Helper function to check if a seat is occupied
  const isSeatOccupied = (row, column) => {
    // Find the seat by row and column letter
    return occupied.some(seat => seat.row === row && seat.column === column);
  };

  

  // Generate seats grid
  const seats = Array.from({ length: theater.rows }, (_, rowIndex) => (
    <div key={rowIndex} className="seat-row">
      {Array.from({ length: theater.columns }, (_, colIndex) => {
        const seatRow = rowIndex + 1;
        const seatColumn = String.fromCharCode(65 + colIndex); // Convert column index to letter (A, B, C, etc.)
        const isOccupied = isSeatOccupied(seatRow, seatColumn);
        const seatClass = isOccupied ? 'seat occupied' : 'seat';

        return (
          <div
            key={`${seatRow}-${seatColumn}`}
            className={seatClass}
            onClick={() => {
              if (!isOccupied) {
                // Handle seat selection logic here
                console.log(`Seat selected: ${seatRow}${seatColumn}`);
              }
            }}
          >
            {`${seatRow}${seatColumn}`}
          </div>
        );
      })}
    </div>
  ));

  return (
    <div className="theater-seats">
      <div className="stage">Stage</div>
      <h4>{theater.name} Seats</h4>
      <div className="seat-grid">
        {seats}
      </div>
      <hr />
      <div className="seat-recap">
        <i>Total seats: {theater.seats}</i>
        <i>Occupied seats: {occupied.length}</i>
        <i>Available seats: {theater.seats - occupied.length}</i>
      </div>
    </div>
  );
  
}

export { TheaterSeats };
