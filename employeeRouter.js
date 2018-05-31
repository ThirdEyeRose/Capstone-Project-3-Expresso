const express = require('express');
const sqlite3 = require('sqlite3');

const employeeRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

function validateEmployeeInput(req, res, next) {
  let employee = req.body.employee;
  if (employee === undefined ||
    !employee.name ||
    !employee.position ||
    !employee.wage) {
    res.status(400).send();
  } else {
    req.employee = employee;
    next();
  }
}

employeeRouter.param('id', (req, res, next, id) => {
  db.get(`SELECT * FROM Employee WHERE id = ${id}`, (error, row) => {
    if (error) {
      res.status(400).send(error);
    } else if (row === undefined) {
      res.status(404).send('Employee not found!');
    } else {
      req.employee = row;
      next();
    }
  });
});

employeeRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (error, rows) => {
    res.send({ employees: rows });
  });
});

employeeRouter.get('/:id', (req, res, next) => {
  res.send({ employee: req.employee });
});

employeeRouter.post('/', validateEmployeeInput, (req, res, next) => {
  db.run(`INSERT INTO Employee (name, position, wage)
  VALUES ($name, $position, $wage)`, {
    $name: req.employee.name,
    $position: req.employee.position,
    $wage: req.employee.wage
  }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM Employee
          WHERE id = ${this.lastID}`, (error, row) => {
            res.status(201).send({ employee: row });
          });
      }
    });
});

module.exports = employeeRouter;
