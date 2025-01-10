const express = require('express');
const router = express.Router();
const db = require('../config/db');
const transporter = require('../config/mailer');
const bookings = [
  // Example booking structure for testing
  { id: 1, name: 'John Doe', student_number: '12345', email: 'john@example.com', date: '2024-11-20', time: '10:00 AM', venue: 'Room A', status: 'Pending' },
  // Add more bookings as needed
];

// ========== Visitor Routes ==========

// Display booking form
router.get('/booking-form', (req, res) => {
  console.log('Accessing booking form route');
  res.render('visitor/booking-form');
});

// Display booking form
router.get('/Hotel', (req, res) => {
  console.log('Accessing hotel form route');
  res.render('visitor/index');
});

// Handle booking submission
router.post('/submit', (req, res) => {
  const { name, student_number, email, date, time, venue } = req.body;
  const sql = `INSERT INTO bookings (name, student_number, email, date, time, venue)
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, student_number, email, date, time, venue], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');  // Redirect to homepage after booking submission
  });
});

// ========== Admin Routes ==========

// Display all bookings (admin view)
router.get('/admin/manage', (req, res) => {
  const sql = 'SELECT * FROM bookings ORDER BY date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-bookings', { bookings: rows });
  });
});

//----------------------Handle booking approval or rejection---------------------\\
// Accept a booking
router.post('/admin/accept/:id', (req, res) => {
  const bookingId = req.params.id;
  
  // Update booking status to 'Accepted'
  const sql = 'UPDATE bookings SET status = "Accepted" WHERE id = ?';
  db.run(sql, [bookingId], function(err) {
    if (err) {
      return console.error(err.message);
    }

    // Retrieve the booking details to send an email to the photographer
    db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
      if (err) {
          console.error(err.message);
          res.status(500).json({ message: "Failed to send email." });
      } else {
          // Email sending logic here if any, then:
          res.status(200).json({ message: "Email successfully sent to photographer" });
      }
    });
  
  });
});

// Decline a booking
router.post('/admin/decline/:id', (req, res) => {
  const bookingId = req.params.id;

  // Update booking status to 'Declined'
  const sql = 'UPDATE bookings SET status = "Declined" WHERE id = ?';
  db.run(sql, [bookingId], function(err) {
    if (err) {
      return console.error(err.message);
    }
      // Redirect back to manage bookings page
  });
});

module.exports = router;
