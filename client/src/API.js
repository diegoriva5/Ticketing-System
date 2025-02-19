import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';


/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

/* API to get all the concerts */

const getConcerts = async () => {
  return getJson(
    fetch(SERVER_URL + 'list-concerts')
  ).then( json => {
    return json.map((concert) => {
      const concertLine = {
        id: concert.id,
        name: concert.name,
        theater_id: concert.theater_id,
        theater_name: concert.theater_name
      }
      return concertLine;
    })
  })
}

/* API to get a specific theater, given its ID */

const getTheaterInfo = async (id) => {
  return getJson(
    fetch(SERVER_URL + 'get-theater-info/' + id)
  ).then( json => {
      const theater = {
        id: json.id,
        name: json.name,
        size: json.size,
        rows: json.rows,
        columns: json.columns,
        seats: json.seats
      }
      return theater;
    })
}

/* API to get all the reservations related on a specific concert */

const getReservations = async (concertID) => {
  return getJson(
    fetch(SERVER_URL + 'reservation/' + concertID)
  ).then( json => {
    return json.map((reservation) => {
      const reservationLine = {
        reservation_id: reservation.reservation_id,
        concert_id: reservation.concert_id,
        row: reservation.row,
        column: reservation.column,
        user_id: reservation.user_id
      }
      return reservationLine;
    })
  })
}

/* API to get all the reservations of a specific user */

const getReservationsOfUser = async (userID) => {
  return getJson(
    fetch(SERVER_URL + 'reservationOfUser/' + userID, {
      credentials: 'include',
    })
  ).then( json => {
    return json.map((reservation) => {
      const reservationLine = {
        concert_id: reservation.concert_id,
        concertName: reservation.concertName,
        theaterName: reservation.theaterName,
        reservedRow: reservation.reservedRow,
        reservedColumn: reservation.reservedColumn
      }
      return reservationLine;
    })
  })
}

/* API to confirm booking */
const confirmBooking = async (bookingData) => {
  const response = await fetch(SERVER_URL + 'create-reservations-entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {  // Check if the response status is not OK (200-299)
    const errorData = await response.json();
    throw new Error(errorData.error);  // Throw the error to be caught by the calling function
  }

  return await response.json(); // If successful, return the JSON response
}


/* API to delete a reservation */
const deleteReservationByID = async(concertID, userID) => {
  return getJson(
    fetch(SERVER_URL + "delete-reservation/" + concertID + "/" + userID, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}

const checkSeatIsAvailable = async(concertID, selectedSeats) => {
  // It generates a list of URLs for checking seat availability by mapping over the selectedSeats array.
  const urls = selectedSeats.map(seat => {
    // The URLs point to a server endpoint (${SERVER_URL}is-seat-available/...) that will return whether each specific seat is available or not.
    return `${SERVER_URL}is-seat-available/${concertID}/${seat.row}/${seat.column}`;
  });

  try {
    // Do the requests in parallel
    const responses = await Promise.all(urls.map(url => fetch(url, { credentials: 'include' })));

    responses.forEach((res, index) => {
      // If one request fails it gives an error
      if (!res.ok) {
        console.error(`Request ${index} failed with status: ${res.status}`);
      }
    });

    // Now all the results are translated in a JSON format
    const occupiedSeatsResults = await Promise.all(responses.map(res => res.json()));

    // Now filter out all the null to get only the occupied seats from the selected seats
    // null is the response if the seat is not occupied, if it is occupied it returns
    // the row and the column of the seat (is-seat-available logic)
    const occupiedSeats = occupiedSeatsResults.filter(result => result != null);

    return occupiedSeats;
  
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

/* Server2 APIs */
async function getDiscount(authToken, sum, loyal) {
  // Retrieve info from an external server, where info can be accessible only via JWT token
  return getJson(fetch('http://localhost:3002/api/' + 'compute-discount', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sum: sum,
      loyal: loyal
    }),
  })
  );
}



/*** Authentication functions ***/

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwarded
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}

async function getAuthToken() {
  return getJson(fetch(SERVER_URL + 'auth-token', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
}
  
const API = { getConcerts, getTheaterInfo, getReservations, getReservationsOfUser, confirmBooking, deleteReservationByID, checkSeatIsAvailable, getDiscount, logIn, getUserInfo, logOut, getAuthToken };

export default API;