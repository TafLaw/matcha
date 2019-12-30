var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get("/", function(req, res){
    console.log('reset password working!');
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
        var email = req.query.email;
        dbo.collection('users').findOne({email: email}, function(err, user) {
            if (user === null)
                console.log("user not found!");
            else{
                console.log("found");
                // res.redirect('http://localhost:8080/reset_pass?email={email}')
                res.render('reset_pass', {email:email});
            }
        });
    });
});

router.post("/", function(req, res){
    console.log(req.body.email);
});
module.exports = router;