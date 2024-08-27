'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');

const convertConcertFromDbRecord = (dbRecord) => {
    const concert = {};
    concert.id = dbRecord.id;
    concert.name = dbRecord.name;
    concert.theater_id = dbRecord.theater_id;
    concert.theater_name = dbRecord.theater_name;

    return concert;
}

exports.listConcerts = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT concerts.id, concerts.name AS name, concerts.theater_id, theaters.name AS theater_name FROM concerts INNER JOIN theaters ON concerts.theater_id = theaters.id";
      db.all(sql, (err, rows) => {
        if (err) { reject(err); }
  
        const concerts = rows.map((e) => {
          const concert = convertConcertFromDbRecord(e);
          return concert;
        });
        resolve(concerts);
      });
    });
};