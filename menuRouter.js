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

function validateMenuItemInput(req, res, next) {
  let menuItem = req.body.menuItem;
  if (menuItem === undefined ||
    !menuItem.name ||
    !menuItem.inventory ||
    !menuItem.price) {
    res.status(400).send();
  } else {
    req.menuItemInput = menuItem;
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

menuRouter.param('menuId', (req, res, next, id) => {
  db.get(`SELECT * FROM Menu WHERE id = ${id}`, (error, row) => {
    if (error) {
      res.status(400).send(error);
    } else if (row === undefined) {
      res.status(404).send('Menu not found!');
    } else {
      req.menuId = id;
      next();
    }
  });
})

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

menuRouter.get('/:menuId/menu-items', (req, res, next) => {
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.menuId}`, (error, rows) => {
    if (error) {
      console.log(error);
    } else {
      res.send({ menuItems: rows });
    }
  });
});

menuRouter.post('/:menuId/menu-items', validateMenuItemInput, (req, res, next) => {
  db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)`, {
    $name: req.menuItemInput.name,
    $description: req.menuItemInput.description || '',
    $inventory: req.menuItemInput.inventory,
    $price: req.menuItemInput.price,
    $menu_id: req.menuId
  }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM MenuItem
          WHERE id = ${this.lastID}`, (error, row) => {
            res.status(201).send({ menuItem: row });
          });
      }
    });
});

module.exports = menuRouter;
