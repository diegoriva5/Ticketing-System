import React, { useState } from 'react';
import { Table, Form, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import '../App.css'; // Ensure CSS is imported

function TheaterSeats(props) {
  const navigate = useNavigate();  

  const { theater, occupied, selectedSeats, setSelectedSeats, onSeatClick, loggedIn } = props;
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

  const handleBookingClick = () => {
    if(selectedSeats.length > 0){
      navigate('/confirmation'); // Navigate to the confirmation page
    } else {
      alert('No selected seats!');
    }
    
  };

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
        const seatClass = isOccupied ? 'seat occupied' : (isSelected && loggedIn) ? 'seat selected' : 'seat';

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
    if(loggedIn){
      setTicketCount(count); // Update the state with the selected number of tickets
    }
  };

  // Handle confirmation of tickets
  const handleConfirm = () => {
    if (ticketCount > 0) {
      const newSelectedSeats = []; // Temporary array to store the seats to be booked
      let seatsNeeded = ticketCount; // Number of tickets needed
  
      // Iterate over the seat grid to find available seats
      for (let rowIndex = 1; rowIndex <= theater.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < theater.columns; colIndex++) {
          const seatRow = rowIndex;
          const seatColumn = String.fromCharCode(65 + colIndex); // Convert column index to letter (A, B, C, etc.)
  
          // If the seat is not occupied and we still need seats, add it to the new selection
          if (!isSeatOccupied(seatRow, seatColumn) && !isSeatSelected(seatRow, seatColumn) && seatsNeeded > 0) {
            newSelectedSeats.push({ row: seatRow, column: seatColumn });
            seatsNeeded--;
          }
  
          // If we've selected enough seats, break out of the loop
          if (seatsNeeded === 0) break;
        }
        if (seatsNeeded === 0) break;
      }
  
      if (newSelectedSeats.length === ticketCount) {
        // Update the selected seats state directly
        setSelectedSeats([...selectedSeats, ...newSelectedSeats]);
  
        // Navigate to the confirmation page
        navigate('/confirmation');
      } else {
        alert('Not enough available seats.');
      }
    } else {
      alert('Please select the number of tickets.');
    }
  };
  

  return (
    <div className="theater-seats">
      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading seats...</span>
        </div>
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
            {loggedIn && (
              <i>Selected seats: {selectedSeats.length}</i>
            )}
          </div>
          <hr />
          {loggedIn ? ( // Show buttons if user is logged in
            <div className="text-center mb-3">
              <Button variant="warning" onClick={handleBookingClick}>
                Click here to book selected seats
              </Button>
              <div className="text-center">
                <div className="my-2 text-center">OR</div>
              </div>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div className="me-2">Select number of tickets: </div>
                <DropdownButton
                  id="dropdown-ticket-select"
                  title={`${ticketCount}`} // Show the current selection
                  className="me-2"
                  variant="dark"
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
                  variant="dark" 
                  onClick={handleConfirm} // Confirm button to handle the booking
                >
                  Confirm Automatic Booking
                </Button>
              </div>
            </div>
          ) : ( // Show log-in prompt if user is not logged in
            <div className="text-center mb-3">
              <p>Log-in if you want to book some seats!</p>
            </div>
          )}
            
        </>
      )}
    </div>
  );
}

export { TheaterSeats };
