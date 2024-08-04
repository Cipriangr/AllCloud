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
//In order to work on both dev and production
app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:8080'] }));

const router = express.Router();

function getRandomDigit() {
    return Math.floor(Math.random() * 10);
}

function sanitizePhoneNumbers(contacts) {
    return contacts.map(contact => {
        if (contact.phone) {
            // Remove non-numeric characters but also remove or add digits if less or more than 10 digits
            contact.phone = contact.phone.replace(/\D/g, '');
            while (contact.phone.length < 10) {
                contact.phone += getRandomDigit();
            }
            if (contact.phone.length > 10) {
                contact.phone = contact.phone.substring(0, 10);
            }
        }
        return contact;
    });
}

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
    let contacts = req.body;

    // Validate the received data
    if (!Array.isArray(contacts) || contacts.length === 0) {
        console.error('Invalid contacts data:', contacts);
        return res.status(400).send('Invalid contacts data');
    }

    contacts = sanitizePhoneNumbers(contacts);

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
                    const emailIndex = 3;
                    const conflictingEmail = values[emailIndex];
                    errorMessage = `Email ${conflictingEmail} is already used. Edit existing contact`;
                } else if (err.message.includes('users.id')) {
                    errorMessage = `An ID for a contact generated is already used. Please try again`;
                } else if (err.message.includes('users.phone')) {
                    const phoneIndex = 4;
                    const conflictingPhone = values[phoneIndex];
                    errorMessage = `Phone number ${conflictingPhone} is already used. Edit existing contact`;
                }
            }

            console.log('Error saving contacts:', err.message);
            res.status(400).send({ errorMessage });
        } else {
            // Respond with a success message
            console.log('Contact is saved');
            res.status(200).send({ message: `Contact ${values[1]} ${values[2]}` });
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
            // i want to sanitize the phone number to return only numbers
            row.phone = row.phone.replace(/\D/g, '');
            res.json(row);
        }
    });
});

router.put('/users/:id', (req, res) => {
    const contactId = parseInt(req.params.id, 10);
    const { firstName, lastName, email, phone, age, gender, title, large, medium, thumbnail } = req.body;

    if (!contactId || !firstName || !lastName || !email || !phone || !age || !gender) {
        return res.status(400).send('Invalid contact data');
    }

    const sql = `UPDATE users SET 
                 firstName = ?, 
                 lastName = ?, 
                 email = ?, 
                 phone = ?, 
                 age = ?, 
                 gender = ?, 
                 title = ?, 
                 large = ?, 
                 medium = ?, 
                 thumbnail = ? 
                 WHERE id = ?`;

    const values = [firstName, lastName, email, phone, age, gender, title, large, medium, thumbnail, contactId];

    // Execute SQL query
    db.run(sql, values, function(err) {
        if (err) {
            console.error('Error updating contact:', err.message);
            let errorMessage = 'An error occurred while updating the contact';

            if (err.message.includes('UNIQUE constraint failed')) {
                if (err.message.includes('users.email')) {
                    errorMessage = 'Email is already used. Edit existing contact';
                } else if (err.message.includes('users.phone')) {
                    errorMessage = 'Phone number is already used. Edit existing contact';
                }
            }

            res.status(400).send({ errorMessage });
        } else if (this.changes === 0) {
            // No rows updated, which means the contact ID was not found
            res.status(404).send('Contact not found');
        } else {
            // Successfully updated
            console.log('Contact updated successfully');
            res.status(200).send({ message: 'Contact updated successfully' });
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