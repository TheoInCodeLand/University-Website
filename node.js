npm run dnpconst bcrypt = require('bcryptjs');
const db = require('./config/db');

const username = 'admin';  // Replace with your desired username
const password = 'password123';  // Replace with your desired password

// Hash the password
const passwordHash = bcrypt.hashSync(password, 10);

// Insert the admin into the database
const sql = 'INSERT INTO admins (username, password_hash) VALUES (?, ?)';
db.run(sql, [username, passwordHash], function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log('Admin user created');
});
