const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');
const path = require('path');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Store in the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save with a unique name
  }
});

const upload = multer({ storage: storage });

// ========== Visitor Routes ==========




















// Display all posts for visitors
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('visitor/home', { posts: rows });
  });
});



















// Display a single post with details
router.get('/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'SELECT * FROM posts WHERE id = ?';
  db.get(sql, [postId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('visitor/post-details', { post: row });
  });
});

// Handle adding a new comment to a post
router.post('/:id/comment', (req, res) => {
    const postId = req.params.id;
    const { visitor_name, comment_text } = req.body;
    const date = new Date().toISOString().slice(0, 10);
  
    const sql = `INSERT INTO comments (post_id, visitor_name, comment_text, date)
                 VALUES (?, ?, ?, ?)`;
    db.run(sql, [postId, visitor_name, comment_text, date], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.redirect(`/posts/${postId}`);  // Redirect back to the post after commenting
    });
});
  
// Handle liking a post (incrementing the like count)
router.post('/:id/like', (req, res) => {
    const postId = req.params.id;
    const sql = `UPDATE posts SET likes = likes + 1 WHERE id = ?`;
    db.run(sql, [postId], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.redirect(`/posts/${postId}`);  // Redirect back to the post after liking
    });
  });
  
// ========== Admin Routes ==========

// Display all posts for admin (manage posts)
router.get('/admin/manage', (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-posts', { posts: rows });
  });
});

// Display form to add a new post (admin)
router.get('/admin/new', (req, res) => {
  res.render('admin/new-post');
});

// Handle adding a new post (admin) (FUNCTIONAL)
router.post('/admin/new', upload.single('media'), (req, res) => {
  const { title, description, category, date, location } = req.body;
  const media_url = req.file ? `uploads/${req.file.filename}` : null; // Store 'uploads/' path

  const sql = `INSERT INTO posts (title, description, category, date, location, media_url)
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [title, description, category, date, location, media_url], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/posts/admin/manage'); // Redirect to manage posts
  });
});

// Handle deleting a post (admin)
router.post('/admin/delete/:id', (req, res) => {
  const postId = req.params.id;
  const sql = 'DELETE FROM posts WHERE id = ?';
  db.run(sql, [postId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/posts/admin/manage');  // Redirect to manage posts after deletion
  });
});

// Search posts (NEEDS FIXING)
router.get('/search-posts', (req, res) => {
  const searchQuery = req.query.search;
  Post.find({ $text: { $search: searchQuery } }).populate('category').exec((err, posts) => {
      if (err) {
          console.error(err);
          res.status(500).send({ message: 'Error searching posts' });
      } else {
          res.render('admin', { posts });
          console.log('search functionality successfuladmin side!')
      }
  });
});

// Filter posts by category
router.get('/filter-posts', (req, res) => {
  const category = req.query.category;
  Post.find({ category }).populate('category').exec((err, posts) => {
      if (err) {
          console.error(err);
          res.status(500).send({ message: 'Error filtering posts' });
      } else {
          res.render('admin', { posts });
      }
  });
});

module.exports = router;
