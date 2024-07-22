const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the database');

    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE)', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            // Insert some sample data
            const user1 = { name: 'Alice', email: 'alice@example.com' };
            const user2 = { name: 'Bob', email: 'bob@example.com' };

            const insertUser = 'INSERT INTO users (name, email) VALUES (?, ?)';
            db.run(insertUser, [user1.name, user1.email], (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
            db.run(insertUser, [user2.name, user2.email], (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        }
    });
});