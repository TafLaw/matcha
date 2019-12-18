var express = require('express');
var passwordHash = require('password-hash');
var nodemailer = require("nodemailer");
const session = require('express-session');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.use(session({secret: 'ssshhhhh', resave: false, saveUninitialized: false}));
//for sending an email
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'jj646019@gmail.com',
      pass: 'matchaproject'
  }
});


router.get("/", function(req, res){
  res.render('index');
});

router.post('/', function(req, res){
  var name = req.body.firstname;
  var surname = req.body.secondname;
  var email = req.body.email;
  var pass = req.body.password;
  var hashedPassword = passwordHash.generate(pass);
  var birthday_day = req.body.birthday_day;
  var birthday_month = req.body.birthday_month;
  var birthday_year = req.body.birthday_year;
  var sub = req.body.submit;

  //check if user doesn't exist
  

  //sign up
  if (sub === "Sign Up"){
    var data = { 
      "name": name,
      "surname": surname,
      "email":email,
      "password":hashedPassword,
      "birthday_day":birthday_day,
      "birthday_month":birthday_month,
      "birthday_year":birthday_year,
      "verify": 0,
      "notifications": 1,
      "code":hashedPassword.substr(0, 9)
    }
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("matcha");
      dbo.collection('users').insertOne(data, function(err, res) {
        if (err) throw err;
        console.log("record inserted successfully!");
        console.log(hashedPassword);
        db.close();
      });
    });
    //send email
    function message(){
      var l1 = 'Your verification Code is ';
      var code = hashedPassword.substr(0, 9);
      var l3 = ', Please Click On ';
      var link = '<a href="http://localhost:8080/verify?email=' + email + '&code=' + code +'">this link</a>';//{}&code=">this link</a>';
      var l4 = ' to activate your account.';
      return l1 + code + l3 + link + l4;
    }
    var mailOptions = {
      from: 'auth@matcha.com',
      to: email,
      subject: 'Matcha Verification',
      html: message()
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  //redirect
    res.render('login', {name: "email sent"});
  }
  //login
  else{
    var email = req.body.email;
    var password = req.body.password;
    var hashedPass = '';
    var verified = 0;

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("matcha");
      var query = {email: email};
      
      dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;
        result.forEach(function(user) {
          hashedPass = user.password;
          verified = user.verify;
          console.log(verified);
        });
        // console.log(result);
        db.close();
      });

      dbo.collection('users').findOne({email: email}, function(err, user) {
        if (!verified)
          console.log("Please verify your account");
        else if (user === null){
          console.log("User not found!");
          res.render("index");
          // return res.status(400).send({message: "User not found"});
        }
        // if (err) throw err;
        else if(passwordHash.verify(password, hashedPass)){
          var sess;
          sess=req.session;
          sess.email=email;
          global.sessionemail=sess.email;
          console.log(this);
          console.log("logged in successfully!");
          db.close();
          if (sess.email)
            res.render('login', {name: "login"});
        }
        else{
          console.log("Incorrect password!");
        }
      });      
  });
  }
});

module.exports = router;
