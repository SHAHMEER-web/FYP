const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const storage = multer.memoryStorage(); // Store in memory as buffer
const upload = multer();
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const db = new sqlite3.Database('./database.db');
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Step 1: Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shahmeerabid134@gmail.com',       // ✅ your Gmail address
        pass: 'eplj ypnf dacl ynum'          // ✅ App password (not Gmail login password)
    }
});


// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html when user visits "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Create  table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    designation TEXT,
    department TEXT,
    image,
    role TEXT,   
    otp TEXT
);
`);

db.run(`
    CREATE TABLE IF NOT EXISTS faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  designation TEXT,
  department TEXT,
  image TEXT,
  cv TEXT
);

`)

db.run(`
  CREATE TABLE IF NOT EXISTS hod_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    author TEXT,
    image TEXT
  );
`);

db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT,
  role TEXT NOT NULL,
  date TEXT NOT NULL
);`
);

db.run(`
    CREATE TABLE IF NOT EXISTS societies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT,
  image TEXT, -- base64
  description TEXT
);`
);
// db.run(`
//     DROP TABLE faculty`)

// View as roles
db.run(`
    CREATE VIEW IF NOT EXISTS hods AS
SELECT * FROM users WHERE role = 'hod';

CREATE VIEW IF NOT EXISTS coordinators AS
SELECT * FROM users WHERE role = 'coordinator';
`)

// Generate OTP by role
function generateOTP(role) {
    const base = Math.floor(1000 + Math.random() * 9000);
    if (role === 'hod') return `hod-${base}`;
    if (role === 'coordinator') return `coord-${base}`;
    return base.toString();
}

// api/register
app.post('/api/register', (req, res) => {
    const { id, firstName, lastName, email, designation, department, image } = req.body;

    const role = designation?.toLowerCase();
    const otp = generateOTP(role); // Assuming this function exists

    if (!id || !firstName || !email || !designation || !department || !image) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (role === 'hod') {
        // ✅ Restriction: Only 1 HOD allowed
        const hodCheckQuery = `SELECT COUNT(*) AS count FROM users WHERE role = 'hod'`;
        db.get(hodCheckQuery, [], (err, row) => {
            if (err) {
                console.error("❌ HOD Check Error:", err);
                return res.status(500).json({ message: "Server error during HOD check." });
            }

            if (row.count > 0) {
                return res.status(400).json({ message: "HOD already exists. Only one HOD is allowed." });
            }

            // ✅ Insert HOD
            insertUser();
        });

    } else if (role === "coordinator") {
        // ✅ Insert multiple coordinators allowed
        insertUser();

    } else {
        return res.status(400).json({ message: "Role not recognized. Allowed: hod or coordinator." });
    }

    function insertUser() {
        const sql = `
            INSERT INTO users (id, firstName, lastName, email, designation, department, role, image, otp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [id, firstName, lastName, email, designation, department, role, image, otp], function (err) {
            if (err) {
                console.error("❌ DB Insert Error:", err.message);
                return res.status(500).json({ message: "Failed to register user." });
            }

            // ✅ Send OTP to hardcoded email
            const adminEmail = "shahmeerabid134@gmail.com";

            const mailOptions = {
                from: 'shahmeerabid134@gmail.com',
                to: adminEmail,
                subject: 'New User Registered',
                text: `New user: ${firstName} ${lastName}\nID: ${id}\nRole: ${role}\nOTP: ${otp}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("❌ Email Error:", error);
                    return res.status(500).json({ message: "Email send failed." });
                }

                console.log("✅ Email sent:", info.response);
                return res.status(200).json({ message: "User registered successfully.", otp });
            });
        });
    }
});

// Get HOD and Coordinators (department-independent)
app.get('/api/users/leaders', (req, res) => {
    const sql = `SELECT * FROM users WHERE role IN ('hod', 'coordinator')`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("❌ Leader Fetch Error:", err.message);
            return res.status(500).json({ message: "Failed to fetch leaders." });
        }
        res.json(rows);
    });
});




// Login route
app.post('/api/login', (req, res) => {
    const { id, password } = req.body;

    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [id], (err, user) => {
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json({ message: 'Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid ID' });
        }

        console.log("🟡 User from DB:", user);
        if (password === user.otp) {
            const role = user.role?.toLowerCase().trim();
            res.json({ message: 'Login successful', role });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});


// delete user route

app.delete('/api/delete-user/:id', (req, res) => {
    const userId = req.params.id;

    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) {
            console.error("Delete error:", err.message);
            return res.status(500).json({ message: "Failed to delete user." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    });
});



// Faculty Post

app.post('/api/faculty', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), (req, res) => {

    console.log("Faculty POST route hit");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { name, designation, department } = req.body;

    const imageBase64 = req.files.image[0].buffer.toString('base64');
    const cvBase64 = req.files.cv[0].buffer.toString('base64');
    // Store as base64

    const sql = `
        INSERT INTO faculty (name, designation, department, image, cv)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, designation, department, imageBase64, cvBase64], function (err) {
        if (err) {

            console.error("❌ DB Error:", err.message);
            return res.status(500).json({ message: "Database insert error." });
        }

        console.log("Faculty added");
        return res.status(200).json({ message: "Faculty added successfully." });
    });
});

app.get('/api/faculty', (req, res) => {
    const department = req.query.department;

    const sql = `SELECT * FROM faculty WHERE department = ?`;
    db.all(sql, [department], (err, rows) => {
        if (err) {
            console.error("❌ Faculty Load Error:", err.message);
            return res.status(500).json({ message: "Database fetch error." });
        }
        return res.json(rows); // ✅ return result to frontend
    });
});

app.delete('/api/faculty/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM faculty WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            console.error("❌ Faculty Delete Error:", err.message);
            return res.status(500).json({ message: "Failed to delete faculty." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Faculty not found." });
        }

        return res.json({ message: "Faculty deleted successfully." });
    });
});

// Hod Message Route

app.post('/api/hod-message', upload.single('image'), (req, res) => {
    const { title, description, author } = req.body;
    const imageBuffer = req.file?.buffer;

    if (!title || !description || !author || !imageBuffer) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const imageBase64 = imageBuffer.toString('base64');

    const sql = `
    INSERT INTO hod_messages (title, description, author, image)
    VALUES (?, ?, ?, ?)
  `;

    db.run(sql, [title, description, author, imageBase64], function (err) {
        if (err) {
            console.error("❌ DB Error:", err.message);
            return res.status(500).json({ message: "Failed to insert data." });
        }

        return res.status(200).json({ message: "Message added successfully." });
    });
});

app.get('/api/hod-messages', (req, res) => {
    const sql = `SELECT * FROM hod_messages ORDER BY id DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("❌ DB Error:", err.message);
            return res.status(500).json({ message: "Database error." });
        }

        // Convert base64 image and add role
        const messages = rows.map(row => ({
            ...row,
            image: `data:image/jpeg;base64,${row.image}`,
            role: "Head of Department"
        }));

        res.json(messages);
    });
});

// Delete a HOD message by ID
app.delete('/api/hod-message/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM hod_messages WHERE id = ?`;

    db.run(sql, [id], function (err) {
        if (err) {
            console.error("❌ Delete HOD Message Error:", err.message);
            return res.status(500).json({ message: "Failed to delete message." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Message not found." });
        }

        res.status(200).json({ message: "Message deleted successfully." });
    });
});




// Announcement Routes
app.post('/api/announcements', (req, res) => {
    const { message, role } = req.body;

    if (!message || !role) {
        return res.status(400).json({ message: "Message and role are required." });
    }

    const date = new Date().toISOString();

    const sql = `INSERT INTO announcements (message, role, date) VALUES (?, ?, ?)`;
    db.run(sql, [message, role, date], function (err) {
        if (err) {
            console.error("❌ Announcement Insert Error:", err.message);
            return res.status(500).json({ message: "Failed to save announcement." });
        }
        res.status(200).json({ message: "Announcement added successfully." });
    });
});

app.get('/api/announcements', (req, res) => {
    const sql = `SELECT * FROM announcements ORDER BY date DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("❌ Announcement Fetch Error:", err.message);
            return res.status(500).json({ message: "Failed to fetch announcements." });
        }
        res.json(rows);
    });
});

app.delete('/api/announcements/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM announcements WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            console.error("❌ Delete Error:", err.message);
            return res.status(500).json({ message: "Failed to delete announcement." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Announcement not found." });
        }

        res.status(200).json({ message: "Announcement deleted successfully." });
    });
});

// Society Routes

app.post('/api/societies', upload.single('image'), (req, res) => {
    const { section, description } = req.body;
    const imageFile = req.file;

    if (!section || !description || !imageFile) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const imageBase64 = imageFile.buffer.toString('base64');

    const sql = `INSERT INTO societies (section, image, description) VALUES (?, ?, ?)`;
    db.run(sql, [section, imageBase64, description], function (err) {
        if (err) {
            console.error("❌ Insert Error:", err.message);
            return res.status(500).json({ message: "Database error." });
        }
        res.status(200).json({ message: "Image added successfully!" });
    });
});

app.get('/api/societies', (req, res) => {
    db.all("SELECT * FROM societies", [], (err, rows) => {
        if (err) {
            console.error("❌ Fetch Error:", err.message);
            return res.status(500).json({ message: "Failed to fetch data." });
        }
        res.json(rows);
    });
});

app.delete('/api/societies/:id', (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM societies WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            console.error("❌ Society Delete Error:", err.message);
            return res.status(500).json({ message: "Failed to delete image." });
        }

        res.status(200).json({ message: "Image deleted successfully." });
    });
});

