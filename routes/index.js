var express = require('express');
var passwordHash = require('password-hash');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get("/", function(req, res){
  res.render('index');
});

router.post('/', function(req, res){
  var name = req.body.firstname;
  var surname = req.body.secondname;
  var email = req.body.email;
  var pass = req.body.password;
  var hashedPassword = passwordHash.generate(pass);
  var sub = req.body.submit
  if (sub === "Sign Up"){
    var data = { 
      "name": name,
      "surname": surname,
      "email":email,
      "password":hashedPassword,
      "verify": 0,
      "notifications": 1
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
  //redirect
    res.render('login', {name: "signup"});
  }
  else{
    var email = req.body.email;
    var password = req.body.password;
    var hashedPass = 'sha1$f741df25$1$b581e66caa8351dcafa45de85eda5ec2352c27b1';

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("matcha");
      dbo.collection('users').findOne({email: email}, function(err, user) {
        if (user === null){
          console.log("User not found!");
          res.render("index");
          // return res.status(400).send({message: "User not found"});
        }
        // if (err) throw err;
        else if(passwordHash.verify(password, hashedPass)){
          console.log("logged in successfully!");
          db.close();
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
