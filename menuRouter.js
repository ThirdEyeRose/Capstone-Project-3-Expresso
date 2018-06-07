const express = require('express');
const sqlite3 = require('sqlite3');

const menuRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (error, rows) => {
    res.send({ menus: rows });
  });
});

module.exports = menuRouter;
