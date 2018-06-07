const express = require('express');
const sqlite3 = require('sqlite3');

const menuRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

function validateMenuInput(req, res, next) {
  let menu = req.body.menu;
  if (menu === undefined ||
    !menu.title ) {
    res.status(400).send();
  } else {
    req.menuInput = menu;
    next();
  }
}

menuRouter.param('id', (req, res, next, id) => {
  db.get(`SELECT * FROM Menu WHERE id = ${id}`, (error, row) => {
    if (error) {
      res.status(400).send(error);
    } else if (row === undefined) {
      res.status(404).send('Menu not found!');
    } else {
      req.menu = row;
      next();
    }
  });
});

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (error, rows) => {
    res.send({ menus: rows });
  });
});

menuRouter.get('/:id', (req, res, next) => {
  res.send({ menu: req.menu });
});

menuRouter.post('/', validateMenuInput, (req, res, next) => {
  db.run(`INSERT INTO Menu (title) VALUES ($title)`, {
    $title: req.menuInput.title
  }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM Menu
          WHERE id = ${this.lastID}`, (error, row) => {
            res.status(201).send({ menu: row });
          });
      }
    });
});

menuRouter.put('/:id', validateMenuInput, (req, res, next) => {
  db.run(`UPDATE Menu SET title = $title WHERE id = $id`, {
    $title: req.menuInput.title,
    $id: req.menu.id
  }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM Menu
          WHERE id = ${req.menu.id}`, (error, row) => {
            res.status(200).send({ menu: row });
          });
      }
    });
});

menuRouter.delete('/:id', (req, res, next) => {
  // Check if menu has menu items associated
  db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.menu.id}`, (error, row) => {
    if (error) {
      console.log(error);
    } else if (row === undefined) {
      // if no, remove menu, return 204
      db.run(`DELETE FROM Menu WHERE id = ${req.menu.id}`, error => {
        if (error) {
          console.log(error);
        } else {
          res.status(204).send();
        }
      });
    } else {
      // if yes, return 400
      res.status(400).send('Menu contains items and cannot be deleted');
    }
  });
});

module.exports = menuRouter;
