const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Save files in public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed!'));
  },
});

// Serve static files for uploads
router.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ========== Route to Add a New Event ==========
router.post('/events', upload.single('picture'), (req, res) => {
  const { title, description, event_date, event_time, location } = req.body;
  const picture = req.file ? req.file.filename : null;
  
  const sql = `
    INSERT INTO events (title, description, event_date, event_time, location, picture)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [title, description, event_date, event_time, location, picture];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add event' });
    }
    res.json({ message: 'Event added successfully', eventId: this.lastID });
  });
});

// ========== Route to Delete an Event ==========
router.delete('/events/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM events WHERE id = ?`;

  db.run(sql, id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete event' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

module.exports = router;
