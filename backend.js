const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: '192.168.0.28',
    user: 'root',
    password: 'Inioluwa1!?',
    database: 'hour_arrival'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

db.query(
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plan_type VARCHAR(50) DEFAULT NULL
    )`,
    (err) => {
        if (err) console.error('Error creating users table:', err);
    }
);

db.query(
    `CREATE TABLE IF NOT EXISTS bus_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bus_id VARCHAR(50) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) console.error('Error creating bus_locations table:', err);
    }
);

app.post('/update-plan', (req, res) => {
    const { username, planType } = req.body;

    if (!username || !planType) {
        return res.status(400).json({ error: 'Username and plan type are required.' });
    }

    const query = 'UPDATE users SET plan_type = ? WHERE username = ?';
    db.query(query, [planType, username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update plan.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Plan updated successfully.' });
    });
});


app.get('/get-bus-location/:bus_id', (req, res) => {
    const { bus_id } = req.params;
    db.query(`SELECT latitude, longitude FROM bus_locations WHERE bus_id = ?`, [bus_id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Bus not found' });
        res.json(results[0]);
    });
});

app.post('/update-bus-location', (req, res) => {
    const { bus_id, latitude, longitude } = req.body;
    db.query(`INSERT INTO bus_locations (bus_id, latitude, longitude) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), updated_at = CURRENT_TIMESTAMP`, [bus_id, latitude, longitude], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update location' });
        res.json({ message: 'Location updated successfully' });
    });
});

app.get('/users-plans', (req, res) => {
    const query = 'SELECT username, plan_type FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching users and plans');
        } else {
            res.status(200).json(results);
        }
    });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User created successfully' });
        }
    );
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(400).json({ error: 'Invalid username or password' });

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }

            res.status(200).json({ message: 'Logged in successfully', username: user.username });
        }
    );
});

app.get('/users', (req, res) => {
    db.query(`SELECT username FROM users`, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

app.delete('/delete-account', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    db.query(
        `DELETE FROM users WHERE username = ?`,
        [username],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found.' });
            }

            res.status(200).json({ message: 'Account deleted successfully.' });
        }
    );
});

app.delete('/delete-user', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    if (username === 'HourArrival') {
        return res.status(403).json({ error: 'Cannot delete the admin account.' });
    }

    try {
        const result = await db.query('DELETE FROM users WHERE username = $1', [username]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post('/update-location', (req, res) => {
    const { bus_id, latitude, longitude } = req.body;

    if (!bus_id || !latitude || !longitude) {
        return res.status(400).json({ error: 'Missing required fields: bus_id, latitude, longitude' });
    }

    const query = `
        INSERT INTO bus_locations (bus_id, latitude, longitude)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        updated_at = CURRENT_TIMESTAMP
    `;

    db.query(query, [bus_id, latitude, longitude], (err) => {
        if (err) {
            console.error('Error updating location:', err);
            return res.status(500).json({ error: 'Failed to update location' });
        }
        res.json({ message: 'Location updated successfully' });
    });
});

app.get('/get-location/:bus_id', (req, res) => {
    const { bus_id } = req.params;

    if (!bus_id) {
        return res.status(400).json({ error: 'Missing required field: bus_id' });
    } else {
    }

    const query = 'SELECT latitude, longitude FROM bus_locations WHERE bus_id = ?';

    db.query(query, [bus_id], (err, results) => {
        if (err) {
            console.error('Error fetching location:', err);
            return res.status(500).json({ error: 'Failed to fetch location' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Bus not found' });
        }

        res.json(results[0]);
    });
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});


const privateKey = fs.readFileSync('./localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('./localhost.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3000, () => {
    console.log('HTTPS Server is running on https://192.168.0.28:3000');
});

app.listen(3001, () => {
    console.log('HTTP Server is running on http://192.168.0.28:3001');
});