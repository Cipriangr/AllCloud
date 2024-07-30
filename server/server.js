const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the database');
});

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

const router = express.Router();

router.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving users');
        } else {
            res.json(rows);
        }
    });
});


router.post('/upload', (req, res) => {
    const contacts = req.body;

    // Log received contacts for debugging
    console.log('Received request body:', contacts);

    // Validate the received data
    if (!Array.isArray(contacts) || contacts.length === 0) {
        console.error('Invalid contacts data:', contacts);
        return res.status(400).send('Invalid contacts data');
    }

    // Generate SQL placeholders and values
    const placeholders = contacts.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    const values = contacts.flatMap(contact => [
        contact.id, contact.firstName, contact.lastName, contact.email, contact.phone,
        contact.age, contact.gender, contact.title, contact.large, contact.medium, contact.thumbnail
    ]);

    // Log SQL query and values for debugging
    const sql = `INSERT INTO users (id, firstName, lastName, email, phone, age, gender, title, large, medium, thumbnail)
                 VALUES ${placeholders}`;
    console.log('SQL Query:', sql);
    console.log('Values:', values);

    // Execute SQL query
    db.run(sql, values, function(err) {
        if (err) {
            let errorMessage = 'An error occurred while saving contacts';

            if (err.message.includes('UNIQUE constraint failed')) {
                if (err.message.includes('users.email')) {
                    errorMessage = 'Email is already used. Edit existing contact';
                } else if (err.message.includes('users.id')) {
                    errorMessage = 'An id for a contact generated is already used. Please try again';
                } else if (err.message.includes('users.phone')) {
                    errorMessage = 'Phone number is already used. Edit existing contact';
                }
            }

            console.log('Error saving contacts:', err.message);
            res.status(400).send({ errorMessage });
        } else {
            // Respond with a success message
            console.log('Contact is saved');
            res.status(200).send({ message: 'Contacts saved successfully' });
        }
    });
});

router.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).send('Error retrieving user');
        } else if (!row) {
            res.status(404).send('User not found');
        } else {
            res.json(row);
        }
    });
});

router.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
        return res.status(400).send('Invalid ID');
    }
    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [userId], function(err) {
        if (err) {
            console.error('Error deleting user:', err.message);
            return res.status(500).send('Error deleting user');
        } else if (this.changes === 0) {
            // Didn't find that ID. I used sqlite3 library this.changes for this
            return res.status(404).send('User not found');
        } else {
            console.log('User deleted successfully');
            res.status(200).send({ message: 'User deleted successfully' });
        }
    });
});


app.use('/', router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});