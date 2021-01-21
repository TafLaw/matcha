const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const logger = require('morgan');
const session = require('client-sessions');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let loginRouter = require('./routes/login');
let verifyRouter = require('./routes/verify');
let resetRouter = require('./routes/reset_pass');
let chatRouter = require('./routes/chatbe');
let profileRouter = require('./routes/profile');
let likeRouter = require('./routes/like');
let likesRouter = require('./routes/likes');

const app = express();

var http = require('http');
// const socketIO = require('socket.io');
let server = http.createServer(app);
// global.io = socketIO(server);
const io = require('socket.io')(server)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(session({secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD', resave: false, saveUninitialized: true}));
app.use(session({
  cookieName: 'session',
  secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD',
  duration: 24*60*60*1000,
  activeDuration: 5*60*1000,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/verify',verifyRouter);
app.use('/reset_pass',resetRouter);
app.use('/chatbe',chatRouter);
app.use('/profile', profileRouter);
app.use('/like', likeRouter);
app.use('/likes', likesRouter);

// catch 404 and forward to error  also blockeds other routes for some strange reason
// app.use(function(req, res, next) {
//   next(createError(404));
// });


//enabling headers required for POST request
app.use(function(request, result, next) {
  result.setHeader("Access-Control-Allow-Origin", "*");
  next();
})

//api for returning all messages
app.post("/get_messages", function(request, result) {
  //get all messages from DB
  connection.query("SELECT * FROM messages WHERE (senderMail = '" + request.body.sender + "' AND receiverMail = '" + request.body.receiver + "') OR (senderMail = '" + request.body.receiver + "' AND receiverMail = '" + request.body.sender + "') ", (err, messages) => {
      result.end(JSON.stringify(messages));
  });
  
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let user = [];



// ==================DATABASE CONNECTION=================

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "matcha_db",
  port: "3306"
})

connection.connect((err) => {
  if (err) {
      throw err
  } else {
      console.log("Database connected!");
  }
})

// ===========================================================


io.on('connection', function(socket){
  console.log('a user connected', socket.id);

  socket.on('user_connected', username=> {
      console.log(username);

      user[username] = socket.id;
      console.log(user);

      // notify all connected clients
      io.emit('user_connected', username);
  });

  socket.on('sendMessage', msg=> {
      console.log(msg);

      var socketId = user[msg.receiverMail];
      console.log("This email " + msg.receiverMail);
      console.log("found it " + socketId);

      connection.query("INSERT INTO messages (senderName, senderMail, receiverMail, message) VALUE ('" + msg.senderName + "', '" + msg.senderMail + "', '" + msg.receiverMail + "', '" + msg.message +"')")
      io.to(socketId).emit("newMessage", msg)
      // socket.broadcast.emit('sendToAll', msg);
  });
});

server.listen(8080, (err) => {
  if (err)  throw err;
  else
    console.log("Server running on port: 8080");
})
module.exports = app;
