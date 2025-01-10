const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Make sure this points to your database configuration

// Route to handle comment submission
router.post('/add', (req, res) => {
  const { postId, userName, commentText } = req.body;

  // Validate input (to ensure we have all data)
  if (!postId || !commentText) {
    return res.status(400).send("Post ID and comment text are required.");
  }

  // Insert comment into the database
  const sql = `INSERT INTO comments (post_id, user_name, comment_text, created_at) VALUES (?, ?, ?, datetime('now'))`;
  db.run(sql, [postId, userName || 'Anonymous', commentText], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error saving comment.");
    }
    // Redirect back to the post or home page after successful comment
    res.redirect('visitor/home');
  });
});


module.exports = router;
