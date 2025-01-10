const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

// Set up database connection
const db = new sqlite3.Database('./university.db');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Save uploads in the public/uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST route to handle form submissions
router.post('/submit', upload.single('image'), (req, res) => {
  const { event_date, location, title, description } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Insert data into the vacations table in the SQLite database
  db.run(
    `INSERT INTO vacations (event_date, location, title, description, image_path) VALUES (?, ?, ?, ?, ?)`,
    [event_date, location, title, description, imagePath],
    function (err) {
      if (err) {
        console.error('Error inserting data into the database:', err);
        return res.status(500).send('Error saving event');
      }
      res.send('Event successfully saved!');
    }
  );
});

module.exports = router;
