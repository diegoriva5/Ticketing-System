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
        const sql = "SELECT reservations.reservation_id, concerts.name AS concert_name, theaters.name AS theater_name, reservations.row AS reserved_row, reservations.column AS reserved_column FROM reservations INNER JOIN concerts ON reservations.concert_id = concerts.id INNER JOIN theaters ON concerts.theater_id = theaters.id WHERE reservations.user_id = ?";
        
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
        const placeholders = seats.map(() => '(?, ?)').join(', ');
        const sql = `SELECT row, column FROM reservations WHERE concert_id = ? AND (row, column) IN (${placeholders})`;

        const params = [concertID, ...seats.flatMap(seat => [seat.row, seat.column])];

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows.length > 0) {
                // Some seats are already reserved
                resolve(false);
            } else {
                // All seats are available
                resolve(true);
            }
        });
    });
};

// Create reservations for the given seats
exports.createReservations = (concertID, seats, userID) => {
    return new Promise((resolve, reject) => {

        // Define the SQL query
        const sql = "INSERT INTO reservations (concert_id, row, column, user_id) VALUES (?, ?, ?, ?)";

        // Loop through each seat and perform the insertion
        for (const seat of seats) {
            // Parse seat string to row and column
            const row = parseInt(seat.slice(0, -1), 10);
            const column = seat.slice(-1);

            // Execute SQL query for the current seat
            db.run(sql, [concertID, row, column, userID], (err) => {
                if (err) {
                    reject(err);
                }

                resolve(json); // All reservations were inserted successfully
            }

            );
        }
    });
};

// This function deletes an existing reservation given its id.
exports.deleteReservation = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM reservations WHERE id = ?';
      db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        } else
          resolve(this.changes);
      });
    });
  }

