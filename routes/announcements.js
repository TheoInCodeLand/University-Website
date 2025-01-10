const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========== Visitor Routes ==========

// Display all announcements on the main page
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM announcements ORDER BY post_date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('visitor/announcements', { announcements: rows });
  });
});

// ========== Admin Routes ==========

// Admin page to manage announcements
router.get('/admin/manage', (req, res) => {
  const sql = 'SELECT * FROM announcements ORDER BY post_date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-announcements', { announcements: rows });
  });
});

// Display form to create a new announcement
router.get('/admin/new', (req, res) => {
  res.render('admin/new-announcement');
});

// Handle creating a new announcement (admin)
router.post('/admin/new', (req, res) => {
  const { announcement_text } = req.body;
  const post_date = new Date().toISOString().slice(0, 10);  // Current date

  const sql = `INSERT INTO announcements (announcement_text, post_date)
               VALUES (?, ?)`;
  db.run(sql, [announcement_text, post_date], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/announcements/admin/manage');  // Redirect to manage announcements after creation
  });
});

// Handle deleting an announcement (admin)
router.post('/admin/delete/:id', (req, res) => {
  const announcementId = req.params.id;
  const sql = 'DELETE FROM announcements WHERE id = ?';
  db.run(sql, [announcementId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/announcements/admin/manage');  // Redirect to manage announcements after deletion
  });
});

module.exports = router;
