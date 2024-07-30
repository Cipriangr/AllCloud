const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the database');

    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, lastName TEXT, email TEXT UNIQUE,
        firstName TEXT, title TEXT, age INTEGER, large TEXT, medium TEXT, thumbnail TEXT, gender TEXT, phone TEXT)`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            const insertUsers = `
              INSERT INTO users (id, lastName, email, firstName, title, age, large, medium, thumbnail, gender, phone)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            //I created some default contacts so I will always have something to display on frontend
            const users = [
                ['3', 'Brown', 'chris.brown@example.com', 'Chris', 'Mr', 18, 'https://randomuser.me/api/portraits/men/28.jpg', 'https://randomuser.me/api/portraits/med/men/28.jpg', 'https://randomuser.me/api/portraits/thumb/men/28.jpg', 'male', '(091)-265-3495'],
                ['2', 'Bob', 'bob@example.com', 'Marlin', 'Mr', 33, 'https://randomuser.me/api/portraits/men/83.jpg', 'https://randomuser.me/api/portraits/med/men/83.jpg', 'https://randomuser.me/api/portraits/thumb/men/83.jpg', 'male', '(640) 542 8882'],
                ['1', 'Alice', 'alice@example.com', 'Johnson', 'Mrs', 25, 'https://randomuser.me/api/portraits/women/4.jpg', 'https://randomuser.me/api/portraits/med/women/4.jpg', 'https://randomuser.me/api/portraits/thumb/women/4.jpg', 'female', '(399)-765-9487'],
                ['5', 'Johnson', 'JohnMichael2@gmai.com', 'Michael', 'Mr', 43, 'https://randomuser.me/api/portraits/thumb/men/28.jpg', 'https://randomuser.me/api/portraits/med/men/60.jpg', 'https://randomuser.me/api/portraits/thumb/men/60.jpg', 'male', '077 510 77 53'],
                ['4', 'Davis', 'Emily@gmail.com', 'Emily', 'Mrs', 55, 'https://randomuser.me/api/portraits/women/66.jpg', 'https://randomuser.me/api/portraits/med/women/66.jpg', 'https://randomuser.me/api/portraits/thumb/women/66.jpg', 'female', '0172-5315864']
            ];

            users.forEach(user => {
                db.run(insertUsers, user, (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            });
        }
    });
});