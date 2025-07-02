const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Create table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
)`);

// Insert example
db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['John', 'john@example.com', 'hashedPass']);
