const express = require('express');
const sqlite3 = require('sqlite3');

const employeeRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (error, rows) => {
    res.send({ employees: rows });
  });
});

module.exports = employeeRouter;
