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
    // this parameter specifies that authentication cookie must be forwared
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

  
const API = { getConcerts, getTheaterInfo, getReservations, logIn, getUserInfo, logOut };

export default API;