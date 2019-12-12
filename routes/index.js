var express = require('express');
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
  var sub = req.body.submit
  if (sub === "Sign Up"){
    var data = { 
      "name": name,
      "surname": surname,
      "email":email, 
      "password":pass,
      "notifications": 1
    }
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("matcha");
      dbo.collection('users').insertOne(data, function(err, res) {
        if (err) throw err;
        console.log("record inserted successfully!");
        db.close();
      });      
  });
  //redirect
    res.render('login', {name: "signup"});
  }
  else
      res.render('login', {name: "login"});
});

module.exports = router;
