[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/XYY1fduM)
# Exam #1234: "Exam Title"
## Student: s322694 RIVA DIEGO

## React Client Application Routes

- Route `/`
    1. When no one is logged in, it displays the navigation bar and the list of concerts. Clicking on "Show seats", the seat map is displayed with the total seats number, the number of occupied seats and the number of available seats. 
    2. When a user is logged in, his reservations are shown on top of the page. Moreover, when "Show seats" is clicked, also the number of selected seats is shown and the user can book tickets. If he clicks on an available seat, it will become yellow and the user can click on the yellow "Click here to book selected tickets" button to book the specific seats he wants; he will then be redirected to the `/confirmation` route. If he wants to book just a number of seats, without regarding of the position, he can pick the number of tickets he wants in the black button on the left and then click on the black "Confirm Automatic Booking" button to book them automatically. 
- Route `/confirmation`
    It shows a recap of the manual booking. It shows the name of the user, the name of the concert, the name of the theater and all the selected seats. Clicking on the green "Confirm Booking" button will send the request to the server, which will confirm or discard the request based on the requirements of the project. Clicking on the red "Back" button will send the user to the main page.
- Route `/login`
    It is the page that enables a user to log in, using the email and the password. 

## API Server

- POST `/api/login`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

## API Server2

- GET `/api/something`
  - request parameters
  - response body content


## Database Tables

- Table `concerts` - contains id, name, theater_id
- Table `reservations` - contains reservation_id, concert_id, row, column, user_id
- Table `theaters` - contains id, name, size, rows, columns, seats
- Table `users` - contains id, email, name, hash, salt, loyalty

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.png)

## Users Credentials

- u1@p.it, pwd
- u2@p.it, pwd
- u3@p.it, pwd
- u4@p.it, pwd
- u5@p.it, pwd
- u6@p.it, pwd

