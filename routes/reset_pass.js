var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');
var nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


var transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
        user: 'jj646019@gmail.com',
        pass: 'drgtcfuavjuacakd'
    }
  });

router.get("/", function(req, res){
  var errorType = '';
  var email = req.query.email.trim();
  function e_mail(email){
    var m = email.match(/@/i);
    if (!m)
      return false;
    return true;
  }
  console.log('reset password working!');

      MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
        dbo.collection('users').findOne({email: email}, function(err, user) {
            if (!e_mail(email)){
              errorType = 'Please enter a valid email address';
              res.render('forgot_pass',{errorType:errorType});
            }
            else if (user === null){
              errorType = "email not found!";
              console.log("email not found!");
              res.render('forgot_pass',{errorType:errorType});
            }
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
                  errorType = 'Success';
                // res.redirect('http://localhost:8080/reset_pass?email={email}')
                res.render('forgot_pass',{errorType:errorType});
            }
        });
    });
});

router.post("/", function(req, res){
    var password = req.body.password.trim();
    var confirmPass = req.body.confirmPass.trim();
    var email = req.body.email;

    //validate password
    function valid(pass){
      var upper = pass.match(/[A-Z]/);
      var lower = pass.match(/[a-z]/);
      var num = pass.match(/[0-9]/);
      var special = pass.match(/[^\w]/);

      if (!upper || !lower || !num || !special)
        return false;
      return true;
    }

    if (password === confirmPass && valid(password)){
        var hashedPassword = passwordHash.generate(password);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("matcha");
            dbo.collection('users').updateOne({email:email},{$set:{password:hashedPassword}}, function(err, res) {
              if (err) throw err;
              console.log("password changed successfully!");
              console.log(hashedPassword);
              function message(){
                var l1 = 'You successfully reset your password<br/>';
                var link = '<a href="http://localhost:8080/">LOGIN</a>';
                return l1 + link;
              }
        
              var mailOptions = {
                from: 'auth@matcha.com',
                to: email,
                subject: 'Password Reset Succesfully',
                html: message()
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              db.close();
            });
          });
          res.redirect('http://localhost:8080');
    }
    else{
      if (password != confirmPass){
        var errorType = 'Passwords do not match!';
        res.render('reset', {errorType:errorType, email:email});
      }
      else if(!valid(password)){
        var errorType = 'Password does not match the required format';
        res.render('reset', {errorType:errorType, email:email});  
      }
    }
    // res.redirect('http://localhost:8080/');
});
module.exports = router;