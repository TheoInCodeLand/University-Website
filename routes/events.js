const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite');

// Route to render home.ejs
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY event_date, event_time';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Database Error');
    } else {
      res.render('visitor/home', { events: rows }); // Pass `events` to the EJS view
    }
  });
});

module.exports = router;
