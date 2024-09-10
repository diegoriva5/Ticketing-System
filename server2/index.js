'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { body, validationResult } = require("express-validator");

const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = 'qTX6walIEr47p7iXtTgLxDTXJRZYDC9egFjGLIn0rRiahB4T24T4d5f59CtyQmH8';

// THIS IS FOR DEBUGGING ONLY: when you start the server, generate a valid token to do tests, and print it to the console
//This is used to create the token
const jsonwebtoken = require('jsonwebtoken');
const expireTime = 3600; //seconds
//const token = jsonwebtoken.sign( { access: 'premium', authId: 1234 }, jwtSecret, {expiresIn: expireTime});
//console.log(token);


// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);

// To return a better object in case of errors
app.use( function (err, req, res, next) {
  //console.log("DEBUG: error handling function executed");
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
} );

/*** APIs ***/
app.post('/api/compute-discount', 
  [
    body('sum').isInt({ min: 0 }).withMessage('Sum must be a non-negative integer'),
    body('loyal').isInt({ min: 0, max: 1 }).withMessage('Loyal must be 0 or 1')
  ], (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { sum, loyal } = req.body;

    // Compute the base discount value
    let baseValue = loyal ? sum : (sum / 3);

    // Generate a random number between 5 and 20
    const randomValue = Math.random() * (20 - 5) + 5;

    // Compute final discount value
    let finalValue = Math.round(baseValue + randomValue);

    if(finalValue < 5){
      res.status(200).json({ discount: 5 });
    } else if(finalValue > 50) {
      res.status(200).json({ discount: 50 });
    } else {
      res.status(200).json({ discount: finalValue });
    }
});



// activate the server
app.listen(port, () => {
  console.log(`Server2 listening at http://localhost:${port}`);
});
