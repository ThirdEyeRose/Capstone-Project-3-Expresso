const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize( () => {
  // Drop and Create Employee Table
  db.run(`DROP TABLE IF EXISTS Employee`);
  db.run(`CREATE TABLE Employee (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER DEFAULT 1
  )`);

  // Drop and Create Timesheet Table
  db.run(`DROP TABLE IF EXISTS Timesheet`);
  db.run(`CREATE TABLE Timesheet (
    id INTEGER PRIMARY KEY,
    hours INTEGER NOT NULL,
    rate INTEGER NOT NULL,
    date INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    FOREIGN KEY(employee_id) REFERENCES Employee(id)
  )`);
});
