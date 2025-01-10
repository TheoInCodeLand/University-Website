const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========== Route to Add a New Comment ==========
router.post('/add-comment', (req, res) => {
  const { postId, userName, commentText } = req.body;

  // Check if all required fields are provided
  if (!postId || !commentText) {
    return res.status(400).json({ error: 'Post ID and comment text are required' });
  }

  const sql = `
    INSERT INTO comments (post_id, username, comment_text)
    VALUES (?, ?, ?)
  `;
  const params = [postId, userName || 'Anonymous', commentText];

  db.run(sql, params, function(err) {
    if (err) {
      console.error("Error adding comment:", err.message);
      return res.status(500).json({ error: 'Failed to submit comment' });
    }
    res.redirect('/');
    console.log('Commented successfully!!')
  });
});

// ========== Route to Retrieve Comments for Each Post ==========
router.get('/get-comments/:postId', (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT * FROM comments WHERE post_id = ? ORDER BY date DESC
  `;
  db.all(sql, [postId], (err, comments) => {
    if (err) {
      console.error("Error retrieving comments:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve comments' });
    }
    res.json(comments); // Send the comments as JSON for frontend processing
  });
});

module.exports = router;
