const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/test', (req, res) => {
  console.log("Test route hit!");
  res.send("Test route works!");
});

// Display the main page for visitors
router.get('/', (req, res) => {
  // SQL queries to fetch posts, announcements, and documents
  // const getPosts = 'SELECT * FROM posts ORDER BY date DESC LIMIT 6'; 


  const getPosts = `
  SELECT posts.*,
         json_group_array(json_object('username', comments.username, 'comment_text', comments.comment_text)) AS comments
  FROM posts
  LEFT JOIN comments ON posts.id = comments.post_id
  GROUP BY posts.id
  ORDER BY posts.date DESC
  `;

  const getAnnouncements = 'SELECT * FROM announcements ORDER BY post_date DESC';
  const getDocuments = 'SELECT * FROM documents ORDER BY upload_date DESC';

  // Execute all queries and render the main page
  db.all(getPosts, [], (err, posts) => {
    if (err) {
      return console.error(err.message);
    }
    db.all(getAnnouncements, [], (err, announcements) => {
      if (err) {
        return console.error(err.message);
      }
      db.all(getDocuments, [], (err, documents) => {
        if (err) {
          return console.error(err.message);
        }
        const sql = 'SELECT * FROM events ORDER BY event_date ASC';
        db.all(sql, [], (err, events) => {
          if (err) {
            console.error('Error fetching events:', err);
            // return res.status(500).send("Failed to retrieve events");
          }
          res.render('visitor/home', { posts, announcements, documents, events });
        })
      
      });
    });
  });
});

// Handle search queries for posts by title or category
router.get('/search', (req, res) => {
  const searchQuery = req.query.query;  // Get the search query from the URL parameters

  // SQL query to search for posts by title or category
  const sql = `
    SELECT * FROM posts
    WHERE title LIKE ? OR category LIKE ?
    ORDER BY date DESC
  `;

  const searchTerm = `%${searchQuery}%`;  // Use wildcards for partial matching

  db.all(sql, [searchTerm, searchTerm], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }

    res.render('visitor/search-results', { posts: rows, searchQuery });  // Render the search results page
  });
});

module.exports = router;
