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