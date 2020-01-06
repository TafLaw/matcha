var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('client-sessions');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var verifyRouter = require('./routes/verify');
var resetRouter = require('./routes/reset_pass');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(session({secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD', resave: false, saveUninitialized: true}));
app.use(session({
  cookieName: 'session',
  secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD',
  duration: 30*60*1000,
  activeDuration: 5*60*1000,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/verify',verifyRouter);
app.use('/reset_pass',resetRouter);

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
app.listen(8080, (err) => {
  if (err)  throw err;
  else
    console.log("Server running on port: 8080");
})
module.exports = app;
