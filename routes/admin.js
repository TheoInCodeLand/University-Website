const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
// Handle new post creation
const multer = require('multer');
const path = require('path');

// Set up multer to store files in the uploads folder
const upload = multer({
  dest: 'public/uploads/',  // Specify the destination folder
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|avi/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Invalid file type');
    }
  },
});

// Middleware to check if admin is logged in
function checkAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();  // Proceed if admin is logged in
  } else {
    res.redirect('/auth/login');  // Redirect to login if not authenticated
  }
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Store in the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save with a unique name
  }
});

// ========== Admin Dashboard Route ==========
router.get('/dashboard', checkAdmin, (req, res) => {
  res.render('admin/dashboard');  // Render the admin dashboard page
});

// ========== Manage Posts ==========
router.get('/posts', checkAdmin, (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-posts', { posts: rows });
  });
});

// Add new post (render form)
router.get('/posts/new', checkAdmin, (req, res) => {
  res.render('admin/new-post');
});



router.post('/posts/new', checkAdmin, upload.single('media'), (req, res) => {
  const { title, description, category, date, location } = req.body;
  const media_url = req.file ? path.join('uploads', req.file.filename) : null; // Save the file path

  const sql = `INSERT INTO posts (title, description, category, date, location, media_url)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [title, description, category, date, location, media_url], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/posts');
  });
});


// Delete a post
router.post('/posts/delete/:id', checkAdmin, (req, res) => {
  const postId = req.params.id;
  const sql = 'DELETE FROM posts WHERE id = ?';
  db.run(sql, [postId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/posts');
  });
});

// ========== Manage Bookings ==========
router.get('/bookings', checkAdmin, (req, res) => {
  const sql = 'SELECT * FROM bookings ORDER BY date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-bookings', { bookings: rows });
  });
});

// Approve a booking
router.post('/bookings/approve/:id', checkAdmin, (req, res) => {
  const bookingId = req.params.id;
  const sql = 'UPDATE bookings SET status = "Approved" WHERE id = ?';
  db.run(sql, [bookingId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/bookings');
  });
});

// Reject a booking
router.post('/bookings/reject/:id', checkAdmin, (req, res) => {
  const bookingId = req.params.id;
  const sql = 'UPDATE bookings SET status = "Rejected" WHERE id = ?';
  db.run(sql, [bookingId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/bookings');
  });
});

// Delete a booking
router.post('/bookings/delete/:id', checkAdmin, (req, res) => {
  const bookingId = req.params.id;
  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.run(sql, [bookingId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/bookings');
  });
});

// ========== Manage Documents ==========
router.get('/documents', checkAdmin, (req, res) => {
  const sql = 'SELECT * FROM documents ORDER BY upload_date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-documents', { documents: rows });
  });
});

// ========== Manage Announcements ==========
router.get('/announcements', checkAdmin, (req, res) => {
  const sql = 'SELECT * FROM announcements ORDER BY post_date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-announcements', { announcements: rows });
  });
});

// Add new announcement (render form)
router.get('/announcements/new', checkAdmin, (req, res) => {
  res.render('admin/new-announcement');
});

// Handle new announcement creation
router.post('/announcements/new', checkAdmin, (req, res) => {
  const { announcement_text } = req.body;
  const post_date = new Date().toISOString().slice(0, 10);

  const sql = `INSERT INTO announcements (announcement_text, post_date)
               VALUES (?, ?)`;
  db.run(sql, [announcement_text, post_date], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/announcements');
  });
});

// Delete an announcement
router.post('/announcements/delete/:id', checkAdmin, (req, res) => {
  const announcementId = req.params.id;
  const sql = 'DELETE FROM announcements WHERE id = ?';
  db.run(sql, [announcementId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/admin/announcements');
  });
});

module.exports = router;
