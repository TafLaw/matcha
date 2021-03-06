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
        pass: 'drgtcfuavjuacakd'
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

  dbo.collection("notifications").updateMany({User:email},{$set:{read:0}}, function(err, res){
    if (err) throw err;
    console.log('read updated successfully');
  });

  dbo.collection('notifications').insertOne(data, function(err, res) {
    if (err) throw err;
    console.log("notification inserted!");
    // db.close();
  });
}

var rating = function(dbo,db,mail){
  var l_user = {liked_user_mail: mail};
  var rate = 0;
  var loves = new Array();
  dbo.collection("connections").find(l_user).toArray( function(err, ress)
  {
      if(err) throw err;
      var x = 0;
      ress.forEach(function(love)
      {
          loves[x] = love.liked_user_mail;
          x++;
      });
      if(loves.length >= 10)
        rate = Number(10);
      else
        rate = loves.length;

      dbo.collection("users").updateOne({email: mail},{$set: { rating: (rate/10) * 100}}, function(err, res)
      {
              if(err) throw err;
              console.log("rating updated");
      });
  });
}

router.get('/', function(req, res){
  if (!req.session.user)
  res.redirect('http://localhost:8080/');
  var mail = req.query.mail;
  var request = req.query.request;
  var search = req.query.liked_user;
  var spl = search.split(" ");
  var liked_user_name = spl[0];
  var liked_user_sname = spl[1];
  
  var op1 = req.query.Option1;
  var op2 = req.query.Option2;
  var op3 = req.query.Option3;

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
          "rating": 0,
          "blocked": 0
      }
      var query = {user_mail:req.session.email, liked_user_mail:mail}
      
      dbo.collection('connections').insertOne(data, function(err, res) {
          if (err) throw err;
          console.log("user liked successfully!");
          // db.close();
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
        if (req.session.user.notifications)
          send(sub, message, mail);
        rating(dbo, db, mail);
        notify(dbo, db, notif, mail);
        if (op3 != 'none')
          op3 = '#' + op3.slice(1, op3.length);
        console.log(op3);
        
        var red = 'http://localhost:8080/search?name=' + request + '&Option1=' + op1 + '&Option2=' + op2 + '&Option3=' + op3;
        //   res.render('search', {liked:liked, liked_back}); 
        res.redirect(red);       
      });
  });
    
  router.get('/dislike', function(req, res){
    if (!req.session.user)
      res.redirect('http://localhost:8080/');
    var mail = req.query.mail;
    var u_email = req.session.user.email;
    var query = {user_mail:u_email, liked_user_mail:mail};
    var query1 = {user_mail:mail, liked_user_mail:u_email};
    var request = req.query.request;
    
    var op1 = req.query.Option1;
    var op2 = req.query.Option2;
    var op3 = req.query.Option3;
    
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha"); 

        dbo.collection('connections').deleteOne(query1, function(err, res) {
          if (err) throw err;
          console.log("deleted u2 successfully!");
          db.close();
        });
        
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
          if (req.session.user.notifications)
            send(sub, message, mail);
          notify(dbo, db, notif, mail);
          
          if (op3 != 'none')
            op3 = '#' + op3.slice(1, op3.length);
          console.log(op3);
          
          var red = 'http://localhost:8080/search?name=' + request + '&Option1=' + op1 + '&Option2=' + op2 + '&Option3=' + op3;
          res.redirect(red);       
    });
});

router.get('/accept', function(req, res){
  if (!req.session.user)
    res.redirect('http://localhost:8080/');
  var mail = req.query.mail;
  var details = req.query.name.split(" ");
  var liked_user_name = details[0];
  var liked_user_sname = details[1];
  
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("matcha");
    var data = {
      "user_name": req.session.user.name,
      "user_sname": req.session.user.surname,
      "liked_user_name": liked_user_name,
      "liked_user_sname": liked_user_sname,
      "user_mail": req.session.user.email,
      "liked_user_mail": mail,
      "liked": 1,
      "liked_back": 1,
      "connected": 1,
      "rating": 0,
      "blocked": 0
  }
  
    // var query = {user_mail:mail, liked_user_mail:req.session.user.email};
    dbo.collection('connections').insertOne(data, function(err, res) {
      if (err) throw err;
      console.log("likedback successfully!");
      db.close();
    });

    dbo.collection('connections').updateOne({user_mail:mail, liked_user_mail:req.session.user.email},{$set:{liked_back:1, connected:1}}, function(err, res) {
        if (err) throw err;
        console.log(mail, req.session.user.email);
        
        console.log("updated successfully!");
        db.close();
      });

      function message(){
        var l1 = req.session.user.name + ' ';
        var l2 = req.session.user.surname;
        var l3 = " liked you back, <br>";
        var link = 'You are now connected.';
        
        return l1 + l2 + l3 + link;
      }
      var notif = req.session.user.name + ' ' + req.session.user.surname + " accepted your like.";
      var sub = 'YOU HAVE A NEW CONNECTION';
      if(req.session.user.notifications)
        send(sub, message, mail);
      notify(dbo, db, notif, mail);
  
      //var red = 'http://localhost:8080/search?name=' + request + '&Option1=' + op1 + '&Option2=' + op2 + '&Option3=' + op3;
      res.redirect('http://localhost:8080/likes');       
  });
  // console.log(mail);
  
});

router.get('/block', function(req, res){
  if (!req.session.user)
    res.redirect('http://localhost:8080/');
  var mail = req.query.mail;
  var sess_user = req.session.user.email;
  var details = req.query.name.split(" ");
  var liked_user_name = details[0];
  var liked_user_sname = details[1];
  
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("matcha");
    dbo.collection('connections').updateMany({$or:[{user_mail:sess_user, liked_user_mail:mail}, {user_mail:mail, liked_user_mail:sess_user}]}, {$set:{connected:0, blocked:1}}, function(err, res){
      if (err) throw err;
      console.log('user blocked');
    
    });
    res.redirect('http://localhost:8080/likes/connections');
  });
});

router.get('/decline', function(req, res){
  if (!req.session.user)
    res.redirect('http://localhost:8080/');
  var mail = req.query.mail;
  var sess_user = req.session.user.email;
  var details = req.query.name.split(" ");
  var liked_user_name = details[0];
  var liked_user_sname = details[1];
  
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("matcha");
    dbo.collection('connections').deleteOne({user_mail:mail, liked_user_mail:sess_user}, function(err, res){
      if (err) throw err;
      console.log('user delined');
      
      function message(){
        var l1 = req.session.user.name + ' ';
        var l2 = req.session.user.surname;
        var l3 = " declined your request.";
        return l1 + l2 + l3;
      }
      var notif = req.session.user.name + ' ' +  req.session.user.surname + " declined your request.";
      var sub = 'REQUEST DECLINED';
      if (req.session.user.notifications)
        send(sub, message, mail);
      notify(dbo, db, notif, mail);
    });
    res.redirect('http://localhost:8080/likes/connections');
  });
});


module.exports = router;