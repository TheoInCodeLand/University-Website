const nodemailer = require('nodemailer');

// Create a transporter object with your email service configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use Gmail or other services
  auth: {
    user: 'thobejanetheo@gmail.com',  // Your email
    pass: '@Theophiles_01%',   // Your email password or app password
  }
});

module.exports = transporter;
