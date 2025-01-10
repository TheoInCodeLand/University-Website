const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/documents/');  // Save documents in 'public/uploads/documents/'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));  // Generate a unique file name
  }
});
const upload = multer({ storage: storage });

// ========== Visitor Routes ==========

// Display all documents for visitors to download
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM documents ORDER BY upload_date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('visitor/documents', { documents: rows });
  });
});

// Handle document download
router.get('/download/:id', (req, res) => {
  const docId = req.params.id;
  const sql = 'SELECT * FROM documents WHERE id = ?';
  db.get(sql, [docId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      const file = path.join(__dirname, '../public/', row.file_path);  // Ensure correct path to file
      res.download(file, (err) => {
        if (err) {
          console.error('Error in file download:', err);
          res.status(500).send('Error downloading the file.');
        }
      });
    } else {
      res.status(404).send('Document not found.');
    }
  });
});

// ========== Admin Routes ==========

// Admin page to manage documents
router.get('/admin/manage', (req, res) => {
  const sql = 'SELECT * FROM documents ORDER BY upload_date DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('admin/manage-documents', { documents: rows });
  });
});

// Display form to upload a new document
router.get('/admin/upload', (req, res) => {
  res.render('admin/new-document');
});

// Handle document upload
router.post('/admin/upload', upload.single('document'), (req, res) => {
  const { doc_title, doc_description } = req.body;
  const file_path = req.file ? req.file.path : null;  // Get the uploaded file path
  const file_name = req.file ? path.basename(req.file.path) : null;  // Extract the file name
  const upload_date = new Date().toISOString().slice(0, 10);  // Current date

  // Insert document info into the database
  const sql = `INSERT INTO documents (doc_title, doc_description, file_path, file_name, upload_date)
               VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [doc_title, doc_description, file_path, file_name, upload_date], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/documents/admin/manage');  // Redirect to the manage documents page after upload
  });
});

// Handle document deletion
router.post('/admin/delete/:id', (req, res) => {
  const docId = req.params.id;
  const sql = 'DELETE FROM documents WHERE id = ?';

  // Delete the document entry from the database
  db.run(sql, [docId], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/documents/admin/manage');  // Redirect to the manage documents page after deletion
  });
});

module.exports = router;
