'use strict';

/* Data Access Object (DAO) module for accessing reservations data */

const db = require('./db');

const convertReservationFromDbRecord = (dbRecord) => {
    const reservation = {};
    reservation.reservation_id = dbRecord.reservation_id;
    reservation.concert_id = dbRecord.concert_id;
    reservation.row = dbRecord.row;
    reservation.column = dbRecord.column;
    reservation.user_id = dbRecord.user_id;

    return reservation;
}

exports.getReservationByConcertID = (concertID) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM reservations WHERE concert_id=?";
        db.all(sql, [concertID], (err, rows) => {
            if (err) { reject(err); }

            const reservations = rows.map((e) => {
                const reservation = convertReservationFromDbRecord(e);
                return reservation;
            });
        resolve(reservations);
          
        });
    });
}

exports.getReservationsByUserID = (userID) => {
    return new Promise((resolve, reject) => {
        // SQL query to join reservations, concerts, and theaters tables
        const sql = "SELECT reservations.reservation_id, concerts.name AS concert_name, theaters.name AS theater_name, reservations.row AS reserved_row, reservations.column AS reserved_column FROM reservations INNER JOIN concerts ON reservations.concert_id = concerts.id INNER JOIN theaters ON concerts.theater_id = theaters.id WHERE reservations.user_id = ? ORDER BY reservations.concert_id, reservations.row, reservations.column";
        
        // Execute the query
        db.all(sql, [userID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Map the result rows to the desired format
            const reservations = rows.map((row) => ({
                reservation_id: row.reservation_id,
                concertName: row.concert_name,
                theaterName: row.theater_name,
                reservedRow: row.reserved_row,
                reservedColumn: row.reserved_column
            }));
            
            resolve(reservations);
        });
    });
};

// Check if all seats are available
exports.checkSeatsAvailability = (concertID, seats) => {
    return new Promise((resolve, reject) => {
        // Parse seat strings to row and column format
        const parsedSeats = seats.map(seat => {
            return {
                row: parseInt(seat.slice(0, -1), 10), // Extract and parse the row number
                column: seat.slice(-1) // Extract the column letter
            };
        });

        // Generate placeholders for the SQL query
        const placeholders = parsedSeats.map(() => '(?, ?)').join(', ');
        
        // SQL query to check if any of the given seats are already reserved
        const sql = `SELECT row, column FROM reservations WHERE concert_id = ? AND (row, column) IN (${placeholders})`;
        
        // Prepare parameters for the query
        const params = [concertID, ...parsedSeats.flatMap(seat => [seat.row, seat.column])];

        // Execute the SQL query
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows.length > 0) {
                resolve(rows);
            } else {
                // All seats are available
                resolve([]);
            }
        });
    });
};


// Create reservations for the given seats
exports.createReservations = async (concertID, seats, userID) => {
    try {
        // Check if the seats are available first
        const areSeatsAvailable = await exports.checkSeatsAvailability(concertID, seats);

        if (areSeatsAvailable.length != 0) {
            throw new Error('Some seats are already reserved');
        }

        console.log(areSeatsAvailable);

        // Define the SQL query
        const sql = "INSERT INTO reservations (concert_id, row, column, user_id) VALUES (?, ?, ?, ?)";

        // Use a Promise array to handle multiple async operations
        const reservationPromises = seats.map(seat => {
            const row = parseInt(seat.slice(0, -1), 10);
            const column = seat.slice(-1);

            return new Promise((resolve, reject) => {
                db.run(sql, [concertID, row, column, userID], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        });

        // Wait for all insertions to complete
        await Promise.all(reservationPromises);
        return true; // All reservations were inserted successfully
    } catch (err) {
        throw err; // Rethrow the error for higher-level handling
    }
};


// This function deletes an existing reservation given its id.
exports.deleteReservation = (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM reservations WHERE reservation_id = ?";
      db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        } else
          resolve(this.changes);
      });
    });
  }

