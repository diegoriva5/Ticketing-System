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
        const sql = "SELECT reservations.concert_id, concerts.name AS concert_name, theaters.name AS theater_name, reservations.row AS reserved_row, reservations.column AS reserved_column FROM reservations INNER JOIN concerts ON reservations.concert_id = concerts.id INNER JOIN theaters ON concerts.theater_id = theaters.id WHERE reservations.user_id = ? ORDER BY reservations.concert_id, reservations.row, reservations.column";
        
        // Execute the query
        db.all(sql, [userID], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Map the result rows to the desired format
            const reservations = rows.map((row) => ({
                concert_id: row.concert_id,
                concertName: row.concert_name,
                theaterName: row.theater_name,
                reservedRow: row.reserved_row,
                reservedColumn: row.reserved_column
            }));
            
            resolve(reservations);
        });
    });
};


// Check if there's already a reservation by the current user on a certain concert
exports.checkUserReservation = (concertID, userID) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(*) AS count FROM reservations WHERE concert_id = ? AND user_id = ?";
        
        db.get(sql, [concertID, userID], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.count > 0); // Resolve true if the user already has a reservation, false otherwise
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
        // Check if the user already has a reservation for this concert
        const hasUserReservation = await exports.checkUserReservation(concertID, userID);

        if (hasUserReservation) {
            throw new Error('User already has a reservation for this concert.');
        }

        // Check if the seats are available first
        const areSeatsAvailable = await exports.checkSeatsAvailability(concertID, seats);

        if (areSeatsAvailable.length != 0) {
            throw new Error('One or more selected seats, colored in blue, were already reserved. Please try again.');
        }


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
    } catch (error) {
        throw error; // Rethrow the error for higher-level handling
    }
};

// Check if all seats are available
exports.isSeatAvailable = (concertID, row, column) => {
    return new Promise((resolve, reject) => {
        
        // SQL query to check if any of the given seats are already reserved
        const sql = "SELECT row, column FROM reservations WHERE concert_id = ? AND row = ? AND column = ?";
        

        // Execute the SQL query
        db.get(sql, [concertID, row, column], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row != undefined) {
                // If it finds the seat, so it is already reserved, return row and column
                resolve(row);
            } else {
                // Seat is available
                resolve(null);
            }
        });
    });
};


// This function deletes an existing reservation given its id.
exports.deleteReservation = (concertID, userID) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM reservations WHERE concert_id = ? AND user_id = ?";
      db.run(sql, [concertID, userID], function (err) {
        if (err) {
          reject(err);
        } else
          resolve(this.changes);
      });
    });
}

