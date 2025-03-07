var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
require('dotenv').config()

const { isUserAuthenticated } = require('./middlewares/authentication')
const { checkUserPermission } = require('./middlewares/request')

var indexRouter = require('./routes/index');
const restaurantsRouter = require('./routes/restaurantsRoute')
const employeesRouter = require('./routes/employesRoute')
const clientsRouter = require('./routes/clientsRoute')
const authRouter = require('./routes/authRoute')
const tablesRouter = require('./routes/tablesRoute')

var app = express();
mongoose.connect(process.env.DB_URI)
.then(result => { console.log('connected to MongoDB')})
.catch(error => console.error(error))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/employes', employeesRouter);
app.use('/clients', clientsRouter);
app.use('/tables', tablesRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
