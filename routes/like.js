var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//for sending an email notifications
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jj646019@gmail.com',
        pass: 'matchaproject'
    }
  });

var send = function(sub, message, email){
     //send email
      var mailOptions = {
        from: 'auth@matcha.com',
        to: email,
        subject: sub,
        html: message()
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

var notify = function(dbo, db, message, email){
  var data = {
    "User": email,
    "notification": message,
    "read": 0
  }

  dbo.collection('notifications').insertOne(data, function(err, res) {
    if (err) throw err;
    console.log("notification inserted!");
    db.close();
  });
}

router.get('/', function(req, res){
    var mail = req.query.mail;
    var request = req.query.request;
    var search = req.query.liked_user;
    var spl = search.split(" ");
    var liked_user_name = spl[0];
    var liked_user_sname = spl[1];
    
    console.log('inside like', mail);
    console.log(liked_user_name);
    console.log(liked_user_sname);
    
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
    
        //data for the connection table
        var data = {
            "user_name": req.session.user.name,
            "user_sname": req.session.user.surname,
            "liked_user_name": liked_user_name,
            "liked_user_sname": liked_user_sname,
            "user_mail": req.session.user.email,
            "liked_user_mail": mail,
            "liked": 1,
            "liked_back": 0,
            "connected": 0,
            "rating": 0
        }
        var query = {user_mail:req.session.email, liked_user_mail:mail}
        
        dbo.collection('connections').insertOne(data, function(err, res) {
            if (err) throw err;
            console.log("user liked successfully!");
            db.close();
          });
          
          function message(){
            var l1 = req.session.user.name + ' ';
            var l2 = req.session.user.surname;
            var l3 = " liked you <br>";
            var link = '<a href="#">see likes</a>';
            
            return l1 + l2 + l3 + link;
          }
          var notif = req.session.user.name + ' ' +  req.session.user.surname + " liked you";
          var sub = 'YOU HAVE A NEW LIKE';
          send(sub, message, mail);
          notify(dbo, db, notif, mail);
          var red = 'http://localhost:8080/search?name=' + request ;
          //   res.render('search', {liked:liked, liked_back}); 
          res.redirect(red);       
        });
    });
    
    router.get('/dislike', function(req, res){
        console.log('found');
        var mail = req.query.mail;
        var u_email = req.session.user.email;
        var query = {user_mail:u_email, liked_user_mail:mail}
        var request = req.query.request;
        
        MongoClient.connect(url, function(err, db) {
            var dbo = db.db("matcha"); 
            
            dbo.collection('connections').deleteOne(query, function(err, res) {
                if (err) throw err;
                console.log("user deleted successfully!");
                db.close();
              });

              function message(){
                var l1 = req.session.user.name + ' ';
                var l2 = req.session.user.surname;
                var l3 = " unliked you, <br>";
                var link = 'You are no longer connected.';
                
                return l1 + l2 + l3 + link;
              }
              var notif = req.session.user.name + ' ' + req.session.user.surname + " unliked you.";
              var sub = 'YOU HAVE AN UNLIKE';
              send(sub, message, mail);
              notify(dbo, db, notif, mail);
              var red = 'http://localhost:8080/search?name=' + request ;
              res.redirect(red);       
        });
});


module.exports = router;