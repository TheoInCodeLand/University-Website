// Import required modules
const express = require('express');
const path = require('path');
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer'); // Import multer
const app = express();

// Set up views and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set up session
app.use(session({
  secret: 'secret_key',  // Replace with your own secret key
  resave: false,
  saveUninitialized: true
}));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Import routes
const vacationsRouter = require('./routes/vacations');
const postRoutes = require('./routes/posts');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const announcementRoutes = require('./routes/announcements');
const visitorRoutes = require('./routes/visitor');
const commentsRouter = require('./routes/comments');
const manageCommentRoutes = require('./routes/managecomment');
const calendarRoutes = require('./routes/calendar');
const eventsRouter = require('./routes/events'); // Adjust path if necessary

// Use routes
app.use('/', vacationsRouter);
app.use('/managecomment', manageCommentRoutes);
app.use('/posts', postRoutes);
app.use('/booking', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);
app.use('/announcements', announcementRoutes);
app.use('/calendar', calendarRoutes);
app.use('/comments', commentsRouter);
app.use('/events', eventsRouter);

// Use visitor routes for the homepage
app.use('/', visitorRoutes);

// Routes start here

// Admin route to manage calendar events
app.get('/admin/manage-calendar-events', (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY event_date ASC';

  db.all(sql, [], (err, events) => {
    if (err) {
      return res.status(500).send('Failed to retrieve events');
    }
    console.log('Events fetched from database for admin page:', events);
    res.render('admin/manage-calendar-events', { events });
  });
});

app.post('/send-email', (req, res) => {
  const { to, subject, message } = req.body;

  // Create a transporter
  const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
          user: 'your-email@gmail.com', // Your email
          pass: 'your-email-password' // Your email password or app password
      }
  });

  const mailOptions = {
      from: 'your-email@gmail.com',
      to: to,
      subject: subject,
      text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send('Error sending email');
      }
      console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
  });
});


// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
