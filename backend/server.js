const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html when user visits "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Create  table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    designation TEXT,
    department TEXT,
    role TEXT,
    otp TEXT
  )
`);

// Coordinator table
db.run(`
  CREATE TABLE IF NOT EXISTS coordinators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    designation TEXT,
    image BLOB
  )
`);

// Generate OTP by role
function generateOTP(role) {
    const base = Math.floor(1000 + Math.random() * 9000);
    if (role === 'hod') return `hod-${base}`;
    if (role === 'coordinator') return `coord-${base}`;
    return base.toString();
}

// Signup route
// app.post('/api/signup', (req, res) => {
//     const { id, firstName, lastName, email, designation, department } = req.body;
//     const role = designation.toLowerCase();
//     const otp = generateOTP(role);

//     const sql = `
//     INSERT INTO users (id, firstName, lastName, email, designation, department, role, otp)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//     db.run(sql, [id, firstName, lastName, email, designation, department, role, otp], function (err) {
//         if (err) {
//             return res.status(400).json({ message: "User already exists or error", error: err.message });
//         }
//         res.json({ message: "User registered", otp });
//     });
// });

app.post('/api/signup', (req, res) => {
    const { id, firstName, lastName, email, designation, department } = req.body;

    if (!id || !firstName || !email || !designation) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const role = designation.toLowerCase(); // You might assign this based on designation
    const otp = generateOTP(role);

    const sql = `
    INSERT INTO users (id, firstName, lastName, email, designation, department, role, otp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    db.run(sql, [id, firstName, lastName, email, designation, department, role, otp], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ message: "User registered", otp });
    });
});

// Login route
app.post('/api/login', (req, res) => {
    const { id, password } = req.body;

    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [id], (err, user) => {
        if (err || !user) return res.status(401).json({ message: 'Invalid ID' });

        if (password === user.otp) {
            res.json({ message: 'Login successful', role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});


// Coordinator Route
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/coordinator', upload.single('image'), (req, res) => {
    const { name, designation } = req.body;
    const image = req.file?.buffer;

    if (!name || !designation || !image) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
    INSERT INTO coordinators (name, designation, image)
    VALUES (?, ?, ?)
  `;

    db.run(sql, [name, designation, image], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Failed to add coordinator' });
        }
        res.status(200).json({ message: 'Coordinator added successfully' });
    });
});

app.get('/api/coordinator', (req, res) => {
    db.all(`SELECT id, name, designation FROM coordinators`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Failed to fetch coordinators' });
        }
        res.json(rows);
    });
});


