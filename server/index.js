/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const { check, validationResult, body } = require('express-validator'); // validation middleware
const cors = require('cors');

const jsonwebtoken = require('jsonwebtoken');

const jwtSecret = 'qTX6walIEr47p7iXtTgLxDTXJRZYDC9egFjGLIn0rRiahB4T24T4d5f59CtyQmH8';
const expireTime = 3600; //seconds

const concertsDao = require('./dao-concerts');
const userDao = require('./dao-users');
const theatersDao = require('./dao-theaters');
const reservationsDao = require('./dao-reservations');

/*** init express and set-up the middlewares ***/
const app = express();

app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret! - change it for the exam!",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: app.get('env') === 'production' ? true : false },
}));


app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}




/*** Utility Functions ***/

// Make sure to set a reasonable value (not too small!) depending on the application constraints
// It is recommended to have a limit here or in the DB constraints to avoid malicious requests waste space in DB and network bandwidth.
const maxString = 160;


// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** Concerts APIs ***/
app.get('/api/list-concerts',  
  (req, res) => {
    concertsDao.listConcerts()
      .then(concerts => res.status(200).json(concerts))
      .catch((err) => res.status(500).json(err));
  }
);

/*** Theaters APIs ***/
app.get('/api/get-theater-info/:id', 
  [ 
    check('id').isInt({min: 1}) 
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    theatersDao.getInfo(req.params.id)
      .then(theaters => res.status(200).json(theaters))
      .catch((err) => res.status(500).json(err));
  }
);

/*** Reservations APIs ***/
app.get('/api/reservation/:concertId', 
  [ 
    check('concertId').isInt({min: 1}) 
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    reservationsDao.getReservationByConcertID(req.params.concertId)
      .then(reservations => res.status(200).json(reservations))
      .catch(err => res.status(500).json(err));
});

app.get('/api/reservationOfUser/:userId', isLoggedIn,
  [
    check('userId').isInt({ min: 1 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    reservationsDao.getReservationsByUserID(req.user.id)
      .then(reservations => {
        if (reservations.length === 0) {
          return res.status(204).send(); // Return 204 if the array is empty
        }
        res.status(200).json(reservations);
      })
      .catch(err => res.status(500).json(err));
  }
);


app.get('/api/is-seat-available/:concertID/:row/:column', 
  [ 
    check('concertID').isInt({min: 1}), 
    check('row').isInt({min: 1}),
    check('column').isString().isAlpha()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    reservationsDao.isSeatAvailable(req.params.concertID, req.params.row, req.params.column)
      .then(seats => res.status(200).json(seats))
      .catch(err => res.status(500).json(err));
  }
)

// API to confirm booking and create reservations
app.post('/api/create-reservations-entry', isLoggedIn, 
  [
    body('concertID').isInt({ min: 1 }).withMessage('Sum must be a non-negative integer'),
    body('userID').isInt({ min: 1 }).withMessage('Loyal must be 0 or 1'),
    body('seats').isArray(),
    body('seats.*').isString().isLength({ min: 2, max: 2})   // checks that each element in seats is of length 2

  ], 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { concertID, seats, userID } = req.body;
    reservationsDao.createReservations(concertID, seats, req.user.id)
      .then(result => res.status(201).json(result))
      .catch(err => { 
        if (err.message === 'User already has a reservation for this concert.') {
          // Send 406 if user already has a reservation
          res.status(406).json({ error: err.message });
        } else if (err.message === 'One or more selected seats, colored in blue, were already reserved. Please try again.') {
          // Handle other specific error cases as needed
          res.status(409).json({ error: err.message }); // Example: conflict error
        } else {
          // General server error
          res.status(500).json({ error: err.message });
        }
    });
  }
);

// API to delete a reservation
app.delete('/api/delete-reservation/:concertId/:userId', isLoggedIn,
  [ 
    check('concertId').isInt({min: 1}), 
    check('userId').isInt({min: 1})
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    reservationsDao.deleteReservation(req.params.concertId, req.user.id)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json(err));
  }
);



/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.status(200).json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {

    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let loyalty = req.user.loyalty;
  let id = req.user.id;

  const payloadToSign = { access: loyalty, authId: id };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.status(200).json({token: jwtToken, loyalty: loyalty});  // authLevel is just for debug. Anyway it is in the JWT payload
});




// Activating the server
const PORT = 3001;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));