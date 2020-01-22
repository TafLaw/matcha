var express = require('express');
var passwordHash = require('password-hash');
var nodemailer = require("nodemailer");
var Sync = require("sync");
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//for sending an email
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'jj646019@gmail.com',
      pass: 'matchaproject'
  }
});


router.get("/", function(req, res){
  var errorType = '';
  res.render('index', {errorType:errorType});
});

router.get('/home', function(req, res){
  var no = 2;
  if (!req.session.user)
    res.redirect('http://localhost:8080/');
  else{
    var name = req.session.user.name;
    function finishRequest(no){
      res.render('home', {name:name, no:no});
    }
    
    MongoClient.connect(url, function(err, db) {
      var dbo = db.db("matcha");
      var check = 3;
      Sync(
        dbo.collection('notifications').find({User:req.session.user.email}).toArray(function(err, resu) {
          if (err) throw err;
          console.log(resu);
          if (!resu.length){
            finishRequest(no);
          }
          resu.forEach(function(number){
            no = number.read;
            finishRequest(no);
            console.log(no);
          });
        })
      );
        // finishRequest(no)
    });
  }
});

router.get("/reset", function(req, res){
  var email = req.query.email;
  res.render('reset', {email:email});
});

router.get("/logout", function(req, res){
  req.session.destroy();
  res.redirect('http://localhost:8080');
  // res.render('index');
});

router.get("/search", function(req, res){
  var user = req.session.user.name;
  var request = req.query.name;
  var liked = new Array();
  var liked_back = new Array();
  var lock = 2;
  
  function pos(arr, umail){
    var c = 0;
    var d;
    arr.forEach(element => {
      if (element != umail)
        c++;
      if (element === umail)
        d = c;
    });
    return d;
  }

  console.log(user);
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    var q = req.query.name;
    var sp = q.split(" ");
    var qn = sp[0].toLowerCase();

    if (sp[1])
      var qs = sp[1].toLowerCase();

    var dbo = db.db("matcha");
    var results = new Array();
    var mail = new Array();
    var connected = new Array();
    var i = 0;
    
    if (qn && !qs){
      var query = { $or: [ { qName:qn}, { qSurname:qn} ] };
    }
    else if(!qn && qs){
      var name = qs;
      var query = {qSurname:name};
    }
    else{
      // var query = {qName:qn, qSurname:qs};
      var query = { $or: [ { qName:qn, qSurname:qs}, { qSurname:qs, qName:qn}, {qName:qs, qSurname:qn}, {qSurname:qn, qName:qs} ] };
    }
    
    dbo.collection("users").find(query).toArray(function(err, result) {
      if (err) throw err;

      result.forEach(function(user) {
        results[i] = user.name + ' ' + user.surname;
        mail[i] = user.email;
        // console.log(user.name, user.surname);
        
        i++;
      });
      lock -= 1;
      var len = results.length;
      
      
      // res.render('search',{results:results, len:len, name:user, mail:mail, liked:liked, liked_back:liked_back, request:request});
      var finishRequest = function(no) {
        res.render('search',{results:results, len:len, name:user, mail:mail, liked:liked, liked_back:liked_back, request:request, connected:connected, no:no});
      }
  
      
      for (i = 0; i < len; i++){
        liked[i] = 0;
        liked_back[i] = 0;
        connected[i] = 0;
      }
      // console.log(result);
      var no = 2;
      Sync(
        dbo.collection('notifications').find({User:req.session.user.email}).toArray(function(err, resu) {
          if (err) throw err;
          // console.log(resu);
          
          resu.forEach(function(number){

            no = number.read;         
          });
        })
      );
      lock += (len - 1);
      async function data(){

        for (i = 0; i < len; i++){
          
          var u_mail = mail[i];
          var qry = {user_mail:req.session.user.email, liked_user_mail:u_mail}
          j = -1;
          await dbo.collection("connections").find(qry).toArray(function(err, result) {           
            if (err) throw err;
            
            result.forEach(function(user) {
              j = pos(mail, user.liked_user_mail);
                
              liked[j] = user.liked;
              liked_back[j] = user.liked_back;
              connected[j] = user.connected;
            });
            lock--;
            if (!lock){
              finishRequest(no);
            }
          });
        }
      }
      data();
      // db.close();
    });
    

          
  });
  
});

router.get("/forgot_pass", function(req, res){
  var errorType = '';
  res.render('forgot_pass',{errorType:errorType});
});

router.get('/notifications', function(req, res){
  var user = req.session.user.name;
  var email = req.session.user.email;

  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    
    var results = new Array();
    var dbo =  db.db("matcha");
    var i = 0;
    var query = {User:email}
    
    dbo.collection("notifications").find(query).toArray(function(err, result){
      if (err) throw err;
      console.log(result);
      
      result.forEach(function(user){
        results[i] = user.notification;
        results[i]
        i++;
      });

      var len = results.length
      var finishRequest = function(){
        res.render('notifications', {len:len, results:results, name:user});
      }
      finishRequest();
    });


  });
  

});

router.post('/', function(req, res){
  var name = req.body.firstname;
  var surname = req.body.secondname;
  
  if (name && surname){
    var qName = name.toLowerCase(); //for searching purposes 
    var qSurname = surname.toLowerCase(); //for searching purposes 
  }
  
  var email = req.body.email;
  var pass = req.body.password;
  var confirmPass = req.body.confirmpass;
  var birthday_day = req.body.birthday_day;
  var birthday_month = req.body.birthday_month;
  var birthday_year = req.body.birthday_year;
  var sub = req.body.submit;
  var errorType = null;
  
  //check if user doesn't exist
  
  //sign up
  if (sub === "Sign Up"){
      
    if (birthday_day == 0 || birthday_month == 0 || birthday_year == 0){
      console.log("birthday incomplete!");
      console.log(birthday_year);
      console.log(birthday_month);
      console.log(birthday_day);
    }
    else if(pass === confirmPass){
      console.log(birthday_year);
      var hashedPassword = passwordHash.generate(pass);
      var data = { 
        "name": name,
        "surname": surname,
        "qName": qName,
        "qSurname": qSurname,
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
          var exist = 0;

          //check if user exists
          dbo.collection("users").find().toArray(function(err, result){
            if (err) throw err;
            result.forEach(function(user){
              if (email === user.email){
                console.log('email found');
                exist = 1;
              }
              
            });
            if (!exist){
              dbo.collection('users').insertOne(data, function(err, res) {
                if (err) throw err;
                console.log("record inserted successfully!");
                console.log(hashedPassword);
                db.close();
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
            else{
              console.log('Email already in use!');
              var errorType = 'Email already in use!';
              res.render('index', {errorType:errorType});
            }
          });
          
            // });
      });
    }else{
      console.log("passwords do not match");
      
    }
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
        console.log(user);
        
        if (user === null){
          errorType = "User not found!"
          console.log("User not found!");
          res.render("index",{errorType:errorType});
          // return res.status(400).send({message: "User not found"});
        }
        else if (!verified){
          errorType = "Account not verified, please verify your account!";
          console.log("Please verify your account!");
          res.render('index',{errorType:errorType})
        }
        else if(passwordHash.verify(password, hashedPass)){
          //create a user session
          req.session.user = user;
          /* global.variable = req.session.user;*/
          console.log("logged in successfully!");
          db.close();
          if (req.session.user.email)
            res.render('home', {name: req.session.user.name, no:''});
        }
        else{
          errorType = "Incorrect password!"
          console.log("Incorrect password!");
          res.render('index', {errorType:errorType});
        }
      });      
  });
  }
});

module.exports = router;
