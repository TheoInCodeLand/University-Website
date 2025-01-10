const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db');

// Display login form
router.get('/login', (req, res) => {
  res.render('admin/login');
});

// Handle login form submission
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM admins WHERE username = ?';

    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error('Error: Internal server error', err.message);
            return res.status(500).send('Internal server error');
        }
        if (row && password === row.password) {  // Directly compare passwords
            req.session.admin = row.id;  // Save admin ID in session
            res.redirect('/admin/dashboard');  // Redirect to admin dashboard after login
            console.log('login successful!');
        } else {
            res.render('admin/login', { error: 'Invalid credentials' });
            console.log('Invalid credentials!');
        }
    });
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log('Error destroying session:', err);
        return res.redirect('/error'); // Or handle the error appropriately
      }
      res.redirect('/auth/login?message=Logout%20was%20successful');
    });
    console.log('Successfully logged out!');
});
  

module.exports = router;
