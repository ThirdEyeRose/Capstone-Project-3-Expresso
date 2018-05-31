const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 4001;

// Use the JSON body parsing utility on all routes
app.use(bodyParser.json());

// Use morgan to display route output in console
app.use(morgan('dev'));

// Set up Employee and Menu routers
const employeeRouter = require('./employeeRouter.js');
app.use('/api/employees', employeeRouter);

//const menuRouter = require('./menuRouter.js');
//app.use('/api/menus', menuRouter);

module.exports = app;
