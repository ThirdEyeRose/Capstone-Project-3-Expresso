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
    req.employeeInput = employee;
    next();
  }
}

function validateTimesheetInput(req, res, next) {
  let timesheet = req.body.timesheet;
  if (timesheet === undefined ||
    !timesheet.hours ||
    !timesheet.rate ||
    !timesheet.date ) {
    res.status(400).send();
  } else {
    req.timesheetInput = timesheet;
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

employeeRouter.param('employeeId', (req, res, next, id) => {
  db.get(`SELECT * FROM Employee WHERE id = ${id}`, (error, row) => {
    if (error) {
      res.status(400).send(error);
    } else if (row === undefined) {
      res.status(404).send('Employee not found!');
    } else {
      req.employeeId = id;
      next();
    }
  });
});

employeeRouter.param('timesheetId', (req, res, next, id) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${id} AND employee_id = ${req.employeeId}`, (error, row) => {
    if (error) {
      res.status(400).send(error);
    } else if (row === undefined) {
      res.status(404).send('Timesheet not found!');
    } else {
      req.timesheetId = id;
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
    $name: req.employeeInput.name,
    $position: req.employeeInput.position,
    $wage: req.employeeInput.wage
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

employeeRouter.put('/:id', validateEmployeeInput, (req, res, next) => {
  db.run(`UPDATE Employee SET (name, position, wage) = ($name, $position, $wage) WHERE id = $id`, {
    $name: req.employeeInput.name,
    $position: req.employeeInput.position,
    $wage: req.employeeInput.wage,
    $id: req.employee.id
  }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM Employee
          WHERE id = ${req.employee.id}`, (error, row) => {
            res.send({ employee: row });
          });
      }
    });
});

employeeRouter.delete('/:id', (req, res, next) => {
  db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = $id`, { $id: req.employee.id }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM Employee
          WHERE id = ${req.employee.id}`, (error, row) => {
            res.send({ employee: row });
          });
      }
    });
});

employeeRouter.get('/:employeeId/timesheets', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.employeeId}`, (error, rows) => {
    res.send({ timesheets: rows });
  });
});

employeeRouter.post('/:employeeId/timesheets', validateTimesheetInput, (req, res, next) => {
  db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id)
  VALUES ($hours, $rate, $date, $employee_id)`, {
    $hours: req.timesheetInput.hours,
    $rate: req.timesheetInput.rate,
    $date: req.timesheetInput.date,
    $employee_id: req.employeeId
  }, function (error) {
    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, row) => {
      console.log(row);
      res.status(201).send({ timesheet: row });
    });
  });
});

employeeRouter.put('/:employeeId/timesheets/:timesheetId', validateTimesheetInput, (req, res, next) => {
  db.run(`UPDATE Timesheet SET (hours, rate, date) =
    ($hours, $rate, $date) WHERE id = $id`, {
      $hours: req.timesheetInput.hours,
      $rate: req.timesheetInput.rate,
      $date: req.timesheetInput.date,
      $id: req.timesheetId
    }, function (error) {
        if (error) {
          console.log(error);
        } else {
          db.get(`SELECT * FROM Timesheet
            WHERE id = ${req.timesheetId}`, (error, row) => {
              res.send({ timesheet: row });
            });
        }
      });
});

module.exports = employeeRouter;
