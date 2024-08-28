'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');

const convertTheatersFromDbRecord = (dbRecord) => {
    const theater = {};
    theater.id = dbRecord.id;
    theater.name = dbRecord.name;
    theater.size = dbRecord.size;
    theater.rows = dbRecord.rows;
    theater.columns = dbRecord.columns;
    theater.seats = dbRecord.seats;

    return theater;
}

exports.getInfo = (theaterID) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, name, size, rows, columns, seats FROM theaters WHERE id=?";
        db.get(sql, [theaterID], (err, row) => {
          if (err) { reject(err); }

          if(row == undefined){
            resolve(null);
          } else {
            const theater = convertTheatersFromDbRecord(row);
            resolve(theater);
          }
          
        });
    });
}