var express = require('express');
var sessio = require("./index");
var dt = require('./myfirstmodule');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

/* Email verification */
router.get('/', function(req, res, next) {
  email = req.query.email;
  code = req.query.code;
  console.log(sessio.setsess);

  MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("matcha");
    dbo.collection('users').updateOne({email:email, code:code},{$set:{verify:1}}, function(err, res) {
      if (err) throw err;
      console.log("updated successfully!");
      db.close();
    });
  });
  res.render('verify', { title: 'TAF' });
});

module.exports = router;