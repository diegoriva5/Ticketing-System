import React, { useState } from 'react';
import '../App.css'; // Ensure CSS is imported

function TheaterSeats(props) {
  const { theater, occupied } = props;

  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  const simulateLoading = () => {
    setTimeout(() => {
      setLoading(false); // Update state to hide the loading message
    }, 2000); // 1-second delay
  };

  // Call simulateLoading immediately to start the timer
  if (loading) {
    simulateLoading();
  }

  // Helper function to check if a seat is occupied
  const isSeatOccupied = (row, column) => {
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
      {loading ? (
        <p>Loading seats...</p> // Show loading message
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export { TheaterSeats };
