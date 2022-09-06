const config = require('config');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sessions = require('express-session')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const appointmentPageRouter = require('./routes/page');
const flash = require('connect-flash')
const appointmentRouter = require('./routes/appointment');
const sessionSecret = config.get('session_secret');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use('/libs', express.static(path.join(__dirname, 'node_modules')))
app.set('view engine', 'ejs');

app.use(sessions({
  secret: sessionSecret,
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: true
}));

app.use(flash())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', appointmentRouter);
app.use('/', appointmentPageRouter);
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
