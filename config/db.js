const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create and open the SQLite database
const db = new sqlite3.Database(path.join(__dirname, '../university.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize the database with the required tables
db.serialize(() => {
  // Create table for posts (to display on the main page)
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    date TEXT,
    location TEXT,
    media_url TEXT,
    likes INTEGER DEFAULT 0
  )`, (err) => {
    if (err) {
      console.error('Error creating posts table:', err.message);
    }
  });

  // Create table for photographer bookings
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    student_number TEXT,
    email TEXT NOT NULL,
    date TEXT,
    time TEXT,
    venue TEXT,
    status TEXT DEFAULT 'Pending'
  )`, (err) => {
    if (err) {
      console.error('Error creating bookings table:', err.message);
    }
  });

  // Create table for university admins
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating admins table:', err.message);
    }
  });

  // Create table for comments (for posts)
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    visitor_name TEXT,
    comment_text TEXT NOT NULL,
    date TEXT,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating comments table:', err.message);
    }
  });

  // Create table for university documents (PDFs, etc.)
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_title TEXT,
    doc_description TEXT,
    file_path TEXT NOT NULL,
    upload_date TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating documents table:', err.message);
    }
  });

  // Create table for announcements
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_text TEXT NOT NULL,
    post_date TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating announcements table:', err.message);
    }
  });
});

module.exports = db;
