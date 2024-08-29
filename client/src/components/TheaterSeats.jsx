import React, { useState } from 'react';
import { Table, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import '../App.css'; // Ensure CSS is imported

function TheaterSeats(props) {

  const { theater, occupied, selectedSeats, onSeatClick } = props;
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(0); // State to track number of ticket I want to book
  

  // Simulate loading delay
  const simulateLoading = () => {
    setTimeout(() => {
      setLoading(false); // Update state to hide the loading message
    }, 2000); // 2-second delay
  };

  // Call simulateLoading immediately to start the timer
  if (loading) {
    simulateLoading();
  }

  // Helper function to check if a seat is occupied
  const isSeatOccupied = (row, column) => {
    return occupied.some(seat => seat.row === row && seat.column === column);
  };

  // Helper function to check if a seat is selected
  const isSeatSelected = (row, column) => {
    return selectedSeats.some(seat => seat.row === row && seat.column === column);
  };

  // Generate seats grid
  const seats = Array.from({ length: theater.rows }, (_, rowIndex) => (
    <div key={rowIndex} className="seat-row">
      {Array.from({ length: theater.columns }, (_, colIndex) => {
        const seatRow = rowIndex + 1;
        const seatColumn = String.fromCharCode(65 + colIndex); // Convert column index to letter (A, B, C, etc.)
        const isOccupied = isSeatOccupied(seatRow, seatColumn);
        const isSelected = isSeatSelected(seatRow, seatColumn);
        const seatClass = isOccupied ? 'seat occupied' : isSelected ? 'seat selected' : 'seat';

        return (
          <div
            key={`${seatRow}-${seatColumn}`}
            className={seatClass}
            onClick={() => onSeatClick(seatRow, seatColumn)} // Use the passed down click handler
          >
            {`${seatRow}${seatColumn}`}
          </div>
        );
      })}
    </div>
  ));

  const availableSeats = theater.seats - occupied.length;

  const handleSelectTickets = (count) => {
    setTicketCount(count); // Update the state with the selected number of tickets
  };

  // Handle confirmation of tickets
  const handleConfirm = () => {
    if (ticketCount > 0) {
      alert(`You have selected ${ticketCount} tickets.`);
      // Further logic can go here, such as passing the count to another component or making an API call
    } else {
      alert('Please select the number of tickets.');
    }
  };

  return (
    <div className="theater-seats">
      {loading ? (
        <p>Loading seats...</p> // Show loading message
      ) : (
        <>
          <div className="stage">Stage</div>
          <div className="seat-grid">
            {seats}
          </div>
          <hr />
          <div className="seat-recap">
            <i>Total seats: {theater.seats}</i>
            <i>Occupied seats: {occupied.length}</i>
            <i>Available seats: {availableSeats}</i>
            <i>Selected seats: {selectedSeats.length}</i>
          </div>
          <hr />
          <div className="text-center mb-3">
            <Button variant="warning">
              Click here to book selected seats
            </Button>
            <div className="text-center">
              <div>OR</div>
            </div>
            <div className="d-flex justify-content-center mb-3">
              <DropdownButton
                id="dropdown-ticket-select"
                title={`Select Number of Tickets (${ticketCount})`} // Show the current selection
                className="me-2"
              >
                {Array.from({ length: availableSeats }, (_, i) => i + 1).map((num) => (
                  <Dropdown.Item 
                    key={num} 
                    eventKey={num}
                    onClick={() => handleSelectTickets(num)} // Update the state when an option is selected
                  >
                    {num}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
              <Button 
                className="ms-2" // Margin to the left
                variant="primary" 
                onClick={handleConfirm} // Confirm button to handle the booking
              >
                Confirm Automatic Booking
              </Button>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}

export { TheaterSeats };
