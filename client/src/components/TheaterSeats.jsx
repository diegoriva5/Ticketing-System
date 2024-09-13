import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Dropdown, DropdownButton, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import API from '../API';

import '../App.css'; // Ensure CSS is imported

function TheaterSeats(props) {
  const navigate = useNavigate();  

  const { theater, occupied, setOccupied, selectedSeats, setSelectedSeats, 
    onSeatClick, loggedIn, user, expandedConcertID, 
    setExpandedConcertID, reloadTrigger, setReloadTrigger,
    message, setMessage, blueSeats, setBlueSeats } = props;
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(0); // State to track number of ticket I want to book (automatically)
  

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

  // Function that handles the manual selection button
  const handleBookingClick = () => {
    if(selectedSeats.length > 0){ // If the user selected one or more seats
      setMessage('');
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

  // Helper function to check if a seat has been booked during the booking phase
  const isSeatBlue = (row, column) => blueSeats.includes(`${row}${column}`);

  // Generate seats grid
  const seats = Array.from({ length: theater.rows }, (_, rowIndex) => (
    <div key={rowIndex} className="seat-row">
      {Array.from({ length: theater.columns }, (_, colIndex) => {
        const seatRow = rowIndex + 1;
        const seatColumn = String.fromCharCode(65 + colIndex); // Convert column index to letter (A, B, C, etc.)
        // Checks the single seat state (occupied, selected, blue)
        const isOccupied = isSeatOccupied(seatRow, seatColumn);
        const isSelected = isSeatSelected(seatRow, seatColumn);
        const isBlue = isSeatBlue(seatRow, seatColumn);
        // Adjust the color of the seat
        const seatClass = isBlue 
          ? 'seat blue' 
          : isOccupied 
            ? 'seat occupied' 
            : (isSelected && loggedIn) 
              ? 'seat selected' 
              : 'seat';

        return (
          <div
            key={`${seatRow}-${seatColumn}`}
            className={seatClass}
            onClick={() => onSeatClick(seatRow, seatColumn)} // Use the passed down click handler
          >
            {`${seatRow}${seatColumn}`} 
          </div>    // {`${seatRow}${seatColumn}`} displays the single seat name
        );
      })}
    </div>
  ));

  const availableSeats = theater.seats - occupied.length;

  const handleSelectTickets = (count) => {
    setTicketCount(count); // Update the state with the selected number of tickets
    setSelectedSeats([]); // If the user selected some seats, remove them from the selected
                          // seats 
  };

  // Handle automatic selection of tickets
  const handleConfirm = async () => {
    if (ticketCount > 0) {
      try {
        // Fetch the latest reservations to ensure we have the current data (multi-user)
        const reservations = await API.getReservations(expandedConcertID);
        setOccupied(reservations);
        setSelectedSeats([]); // Clear selected seats after updating reservations


        const newSelectedSeats = []; // Temporary array to store the seats to be booked
        let seatsNeeded = ticketCount; // Number of tickets needed

        // Iterate over the seat map to find available seats based on the updated reservations
        for (let rowIndex = 1; rowIndex <= theater.rows; rowIndex++) {
          for (let colIndex = 0; colIndex < theater.columns; colIndex++) {
            const seatRow = rowIndex;
            const seatColumn = String.fromCharCode(65 + colIndex); // Convert column index to letter (A, B, C, etc.)

            // Check if the seat is occupied
            const isCurrentlyOccupied = reservations.some(
              (seat) => seat.row === seatRow && seat.column === seatColumn
            );

            // If the seat is not occupied and we still need seats, add it to the new selection
            if (!isCurrentlyOccupied && seatsNeeded > 0) {
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
          
          // Build the object to send the request to the server
          try {
            const bookingData = {
              concertID: expandedConcertID, // Use the concert ID from props
              seats: newSelectedSeats.map((seat) => `${seat.row}${seat.column}`),
              userID: user.id, // Use the user ID from props
            };

            await API.confirmBooking(bookingData);
            setReloadTrigger(true); // Trigger a reload of the user reservations' list

            // Fetch updated reservations to refresh the view and make reserved seats red
            const updatedReservations = await API.getReservations(expandedConcertID);
            setOccupied(updatedReservations);
            setSelectedSeats([]); // Clear selected seats
            setTicketCount(0);
            setMessage('');
            alert("Booking successful!");
          } catch (error) {
            alert(
              "Error. The reason will be displayed in red at the top of the page after pressing OK."
            );
            setMessage(error.message);
            setSelectedSeats([]); // Clear selected seats after failed booking
            setTicketCount(0);
            navigate("/"); // Navigate back to the home page after failed confirmation
          }
        } else {
          setMessage("Not enough available seats.");
        }
      } catch (error) {
        console.error(error);
        alert(
          "Error. The reason will be displayed in red at the top of the page after pressing OK."
        );
        setMessage(error.message);
        setSelectedSeats([]); // Clear selected seats after failed booking
        setTicketCount(0);
        navigate("/"); // Navigate back to the home page after failed confirmation
      }
    } else {
      alert("Please select the number of tickets.");
    }
  };


  
  /* visually-hidden hides the message visually but will be annouced to screen readers */
  return (
    <div className="theater-seats">
      {loading ? (
        <div className="d-flex flex-column align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden text-white">Loading seats...</span>
          </div>
          <div className="mt-2 text-primary text-primary">Loading seats...</div>
        </div>
      ) : (
        <>
          <div className="stage">Stage</div>
          <div className="seat-grid">
            {seats}
          </div>
          <hr />
          <div className="seat-info-container">
            {/* Legend Section */}
            <div className="seat-legend py-0">
              <div className="legend-item">
                <div className="seat available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="seat occupied"></div>
                <span>Occupied</span>
              </div>
              {loggedIn && (
                <>
                  <div className="legend-item">
                    <div className="seat selected"></div>
                    <span>Selected</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat blue"></div>
                    <span>Pending Reservation</span>
                  </div>
                </>
              )}
            </div>
            <div className="seat-recap my-0">
              <i className='text-black'>Total seats: {theater.seats}</i>
              <i className='text-black'>Occupied seats: {occupied.length}</i>
              <i className='text-black'>Available seats: {availableSeats}</i>
              {loggedIn && (
                <i className='text-black'>Selected seats: {selectedSeats.length}</i>
              )}
            </div>
          </div>

          <hr />
          {loggedIn ? ( // Show buttons if user is logged in
            <div className="text-center mb-3">
              <Button variant="warning" onClick={handleBookingClick}>
                Click here to book selected seats
              </Button>
              <div className="text-center">
                <div className="my-2 text-center text-black">OR</div>
              </div>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div className="me-2 text-black">Select number of tickets: </div>
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
          ) : (
            <Alert variant="info" className="text-center mb-3 custom-alert">
              <i className="bi bi-exclamation-triangle-fill me-3"></i>
              Log in if you want to book some seats!
              <i className="bi bi-exclamation-triangle-fill ms-3"></i>
            </Alert>
          )}

            
        </>
      )}
    </div>
  );
}

export { TheaterSeats };
