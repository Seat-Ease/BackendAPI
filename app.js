const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const indexRouter = require('./routes/index');
const restaurantsRouter = require('./routes/restaurantsRoute')
const clientsRouter = require('./routes/clientsRoute')
const authRouter = require('./routes/authRoute')

const app = express();
const corsOptions = {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'UPDATE'],
  credentials: true
}
mongoose.connect(process.env.DB_URI)
.then(result => { console.log('connected to MongoDB')})
.catch(error => console.error(error))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions))

app.use('/', indexRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/clients', clientsRouter);
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
});

module.exports = app;
