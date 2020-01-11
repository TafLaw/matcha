var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');
var nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";



router.get("/", function(req, res){
    console.log('reset password working!');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jj646019@gmail.com',
            pass: 'matchaproject'
        }
      });

    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
        var email = req.query.email;
        dbo.collection('users').findOne({email: email}, function(err, user) {
            if (user === null)
                console.log("user not found!");
            else{
                console.log("found");
                function message(){
                    var l1 = '<h2>Reset your password?</h2><br/>';
                    var l3 = "If you requested a password reset for " + email +",<br/> click the link below. If you didn't make this request,<br/> ignore this email.<br/>";
                    var link = '<a href="http://localhost:8080/reset?email=' + email +'">reset password</a>';
                    return l1 + l3 + link;
                  }
            
                  var mailOptions = {
                    from: 'auth@matcha.com',
                    to: email,
                    subject: 'Reset Password',
                    html: message()
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                // res.redirect('http://localhost:8080/reset_pass?email={email}')
                res.render('forgot_pass');
            }
        });
    });
});

router.post("/", function(req, res){
    var password = req.body.password;
    var confirmPass = req.body.confirmPass;
    var email = req.body.email;

    if (password === confirmPass){
        var hashedPassword = passwordHash.generate(password);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("matcha");
            dbo.collection('users').updateOne({email:email},{$set:{password:hashedPassword}}, function(err, res) {
              if (err) throw err;
              console.log("password changed successfully!");
              console.log(hashedPassword);
              db.close();
            });
          });
    }
    // res.redirect('http://localhost:8080/');
    res.render('index')
});
module.exports = router;