const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the database');

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        lastName TEXT, 
        email TEXT UNIQUE,
        firstName TEXT, 
        title TEXT, 
        age INTEGER, 
        large TEXT, 
        medium TEXT, 
        thumbnail TEXT, 
        gender TEXT, 
        phone TEXT
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Users table created or already exists.');
            // Optionally, you can delete existing data if needed
            // db.run('DELETE FROM users');
        }
    });
});
