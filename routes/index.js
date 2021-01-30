var express = require('express');
var passwordHash = require('password-hash');
var nodemailer = require("nodemailer");
var Sync = require("sync");
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var queryFunctions = require('./profile');

//for sending an email
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jj646019@gmail.com',
    pass: 'drgtcfuavjuacakd'
  }
});


router.get("/", function (req, res) {
  var errorType = '';
  res.render('index', { errorType: errorType });
});

router.get('/home', async function (req, res) {
  var viewData = new Array();
  var no = 2;

  if (!req.session.user) {
    res.redirect('http://localhost:8080/');
  }
  else {
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db("matcha");
      let active_email = req.session.user.email;

      userscall();

      async function userscall() {
        let profilesData = await queryFunctions.selectDB("SELECT * FROM profile", '', "PROFILE");

        const response = dbo.collection("users").find({});

        for (let user = await response.next(); user != null; user = await response.next()) {
          if (user.email != active_email) {
            viewData.push(Object.assign(user, profilesData.find(profile => profile.email === user.email)));
          }
        }

        console.log(viewData);
        callno();
      }

      async function callno() {
        const response = dbo.collection('notifications').find({ User: req.session.user.email });

        for (let notifications = await response.next(); notifications != null; notifications = await response.next()) {
          no = notifications.read;
        }
        finishRequest();
      }

      function finishRequest() {
        res.render('home', { profiles: viewData, no: no, currentUser: req.session.user.name });
      }
    });
  }

});

router.get("/reset", function (req, res) {
  var email = req.query.email;
  res.render('reset', { email: email, errorType: '' });
});

router.get("/logout", function (req, res) {
  if (!req.session.user)
    res.redirect('http://localhost:8080/');

  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("matcha");
    if (err) throw err;
    var time = new Date();
    dbo.collection("users").updateOne({ email: req.session.user.email }, { $set: { activity: time } }, function (err, act) {
      if (err) throw err;
    });
    req.session.destroy();
  });

  res.redirect('http://localhost:8080');
  // res.render('index');
});

router.get("/search", function (req, res) {
  if (!req.session.user)
    res.redirect('http://localhost:8080');
  var user = req.session.user.name;
  var active_email = req.session.user.email;
  var request = req.query.name.trim();
  var liked = new Array();
  var liked_back = new Array();
  var fliked = new Array();
  var fliked_bck = new Array();
  var conn = new Array();
  var images = new Array();
  var fblocked = new Array();
  var lock = 2;
  var user_image = '';
  //filters
  var rlen = 0;
  var fil1 = req.query.Option1;
  var fil2 = req.query.Option2;
  var fil3 = req.query.Option3;


  function takeValues(fblocked, images, fTag, result, len, user, mail, liked, liked_back, request, connected, no, fil1, fil2, fil3) {
    rlen++;

    if (rlen === result.length) {
      console.log('stop');
      len = 0;
      res.render('search', { blocked: fblocked, user_image: user_image, active: active_email, image: images, results: fTag, len: len, name: user, mail: mail, liked: liked, liked_back: liked_back, request: request, connected: connected, no: no, op1: fil1, op2: fil2, op3: fil3 });
    }
  }

  function checkLiked(results, mail, email, liked) {
    var len = results.length;

    for (i = 0; i < len; i++) {
      if (mail[i] === email)
        lik = liked[i];
    }

    return lik;
  }

  function checkLiked_back(results, mail, email, liked_back) {
    var len = results.length;
    for (i = 0; i < len; i++) {
      if (mail[i] === email)
        lik_bck = liked_back[i];
    }
    return lik_bck;
  }

  function checkBlocked(results, mail, email, blocked) {
    var len = results.length;
    for (i = 0; i < len; i++) {
      if (mail[i] === email)
        var blckd = blocked[i];
    }
    return blckd;
  }

  function checkConnection(results, mail, email, connect) {
    var len = results.length;
    for (i = 0; i < len; i++) {
      if (mail[i] === email)
        conne = connect[i];
    }
    return conne;
  }

  function getName(results, mail, email) {
    var len = results.length;

    for (i = 0; i < len; i++) {
      if (mail[i] === email)
        return results[i];
    }
  }

  function pos(arr, umail) {
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

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var q = req.query.name.trim();
    var sp = q.split(" ");
    var qn = sp[0].toLowerCase();

    if (sp[1])
      var qs = sp[1].toLowerCase();

    var dbo = db.db("matcha");
    var results = new Array();
    var mail = new Array();
    var fTag = new Array();
    var fTagMail = new Array();
    // var al_liked = new Array();
    var blocked = new Array();
    var connected = new Array();
    var i = 0;

    if (qn && !qs) {
      if (fil1 != 'none' && fil2 == 'none') {
        var spf = fil1.split("-");
        var a = Number(spf[0]);
        var b = Number(spf[1]);
        var query = { $or: [{ qName: qn, age: { "$gte": a, "$lte": b } }, { qSurname: qn, age: { "$gte": a, "$lte": b } }] };
      }
      else if (fil2 != 'none' && fil1 == 'none') {
        var spf = fil2.split("-");
        var a = Number(spf[0]);
        var b = Number(spf[1]);

        var query = { $or: [{ qName: qn, rating: { "$gte": a, "$lte": b } }, { qSurname: qn, rating: { "$gte": a, "$lte": b } }] };
      }
      else if (fil2 != 'none' && fil1 != 'none') {
        console.log('running this');
        var spf = fil1.split("-");
        var spf1 = fil2.split("-");
        var a = Number(spf[0]);
        var b = Number(spf[1]);
        var a1 = Number(spf1[0]);
        var b1 = Number(spf1[1]);

        var query = { $or: [{ qName: qn, age: { "$gte": a, "$lte": b }, rating: { "$gte": a1, "$lte": b1 } }, { qSurname: qn, age: { "$gte": a, "$lte": b }, rating: { "$gte": a1, "$lte": b1 } }] };

      }
      else
        var query = { $or: [{ qName: qn }, { qSurname: qn }] };
    }
    else if (!qn && qs) {
      var name = qs;
      var query = { qSurname: name };
    }
    else {

      if (fil1 != 'none') {
        var spf = fil1.split("-");
        var a = Number(spf[0]);
        var b = Number(spf[1]);
        console.log('here');
        var query = { $or: [{ qName: qn, qSurname: qs, age: { "$gte": a, "$lte": b } }, { qSurname: qs, qName: qn, age: { "$gte": a, "$lte": b } }, { qName: qs, qSurname: qn, age: { "$gte": a, "$lte": b } }, { qSurname: qn, qName: qs, age: { "$gte": a, "$lte": b } }] };
      }
      else if (fil2 != 'none') {
        var spf = fil2.split("-");
        var a = Number(spf[0]);
        var b = Number(spf[1]);
        var query = { $or: [{ qName: qn, qSurname: qs, rating: { "$gte": a, "$lte": b } }, { qSurname: qs, qName: qn, rating: { "$gte": a, "$lte": b } }, { qName: qs, qSurname: qn, rating: { "$gte": a, "$lte": b } }, { qSurname: qn, qName: qs, rating: { "$gte": a, "$lte": b } }] };

      }
      else if (fil1 != 'none' && fil2 != 'none') {
        var spf = fil1.split("-");
        var a = Number(spf[0]);
        var b = Number(spf[1]);
        var spf1 = fil2.split("-");
        var a1 = Number(spf1[0]);
        var b1 = Number(spf1[1]);
        var query = { $or: [{ qName: qn, qSurname: qs, rating: { "$gte": a1, "$lte": b1 }, age: { "$gte": a, "$lte": b } }, { qSurname: qs, qName: qn, age: { "$gte": a, "$lte": b }, rating: { "$gte": a1, "$lte": b1 } }, { qName: qs, qSurname: qn, age: { "$gte": a, "$lte": b }, rating: { "$gte": a1, "$lte": b1 } }, { qSurname: qn, qName: qs, age: { "$gte": a, "$lte": b }, rating: { "$gte": a1, "$lte": b1 } }] };

      }
      else
        var query = { $or: [{ qName: qn, qSurname: qs }, { qSurname: qs, qName: qn }, { qName: qs, qSurname: qn }, { qSurname: qn, qName: qs }] };
    }

    dbo.collection("users").find(query).toArray(function (err, result) {
      if (err) throw err;

      result.forEach(function (user) {
        results[i] = user.name + ' ' + user.surname;
        mail[i] = user.email;
        i++;
      });
      lock -= 1;
      var len = results.length;

      var finishRequest = function (no) {
        rlen = 0;

        if (fil2 == 'none' && fil3 != 'none') {
          liked = fliked;
          liked_back = fliked_bck;
          len = fTag.length;
          if (!fTag.length)
            len = 0;
          res.render('search', { blocked: fblocked, user_image: user_image, active: active_email, image: images, results: fTag, len: len, name: user, mail: fTagMail, liked: liked, liked_back: liked_back, request: request, connected: conn, no: no, op1: fil1, op2: fil2, op3: fil3 });
        }
        else
          res.render('search', { blocked: blocked, user_image: user_image, active: active_email, image: images, results: results, len: len, name: user, mail: mail, liked: liked, liked_back: liked_back, request: request, connected: connected, no: no, op1: fil1, op2: fil2, op3: fil3 });
      }

      //this function checks if each account has a profile pic
      async function checkImg(dbo, mail, images, flag) {
        let profileData = await queryFunctions.selectDB("SELECT * FROM profile", "", "PROFILE");
        for (profile in profileData) {
          let usr = profileData[profile].email;
          let inc = mail.includes(usr);
          let path = profileData[profile].image;
          if (profileData[profile].email === req.session.user.email) {
            user_image = path;
          }
          if (inc) {
            let j = pos(mail, usr);
            images[j] = path;
          }
        }

        if (flag == 'finish')
          finishRequest(no);
        else if (flag == 'take')
          takeValues(fblocked, images, fTag, results, len, user, fTagMail, fliked, fliked_bck, request, conn, no, fil1, fil2, fil3);
      }


      for (i = 0; i < len; i++) {
        liked[i] = 0;
        liked_back[i] = 0;
        connected[i] = 0;
        // al_liked[i] = 0; //check if user has already liked the active session
        images[i] = 0;
        conn[i] = 0;
        blocked[i] = 0;
      }
      // console.log(result);
      var no = 2;
      Sync(
        dbo.collection('notifications').find({ User: req.session.user.email }).toArray(function (err, resu) {
          if (err) throw err;
          // console.log(resu);

          resu.forEach(function (number) {

            no = number.read;
          });
        })
      );
      lock += (len - 1);

      async function tags() {
        let j = 0;
        for (i = 0; i < len; i++) {
          let u_mail = mail[i];
          let qry = { email: u_mail, tag: fil3 };
          let tag = fil3.replace('#', '').toLowerCase();
          let profiles = await queryFunctions.selectDB("SELECT * FROM profile WHERE email = ?", [[u_mail]], "PROFILE");
          let Key = profiles[0].profile_id;
          let tagsData = await queryFunctions.selectDB("SELECT " + tag + " FROM activities WHERE profile_id = " + queryFunctions.mysql.escape(Key), "", "ACTIVITIES");

          console.log(tagsData.length);
          console.log(Key);
          if (tagsData.length && tagsData[0][tag] == 1 && tagsData[0][tag] != null) {
            fTag[j] = getName(results, mail, profiles[0].email);
            fTagMail[j] = profiles[0].email;
            conn[j] = checkConnection(results, mail, profiles[0].email, connected);
            fliked[j] = checkLiked(results, mail, profiles[0].email, liked);
            fliked_bck[j] = checkLiked_back(results, mail, profiles[0].email, liked_back);
            fblocked[j] = checkBlocked(results, mail, profiles[0].email, blocked);
          }
          j++;
        }
        let flag = 'finish';
        await checkImg(dbo, fTagMail, images, flag);
      }
      async function data() {
        for (i = 0; i < len; i++) {

          var u_mail = mail[i];
          var qry = { user_mail: req.session.user.email, liked_user_mail: u_mail }
          j = -1;
          await dbo.collection("connections").find(qry).toArray(async function (err, result) {
            if (err) throw err;

            result.forEach(function (user) {
              j = pos(mail, user.liked_user_mail);
              liked[j] = user.liked;
              blocked[j] = user.blocked;
              liked_back[j] = user.liked_back;
              connected[j] = user.connected;
            });
            lock--;

            if (fil3 != 'none' && !lock) {
              //tags filter here
              tags();
            }
            else if (!lock) {
              console.log(lock);

              console.log('hahvgjvgjvjg');

              var flag = 'finish';
              await checkImg(dbo, mail, images, flag);
              // finishRequest(no);
            }
            console.log('hereeer')
          });
        }
        if (!lock) {
          var flag = 'finish';
          await checkImg(dbo, mail, images, flag);
          // finishRequest(no);
        }
      }
      data();
      // db.close();
    });



  });

});

router.get("/forgot_pass", function (req, res) {
  var errorType = '';
  res.render('forgot_pass', { errorType: errorType });
});

router.get('/notifications', function (req, res) {
  if (!req.session.user)
    res.redirect('http://localhost:8080/');

  var user = req.session.user.name;
  var email = req.session.user.email;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var results = new Array();
    var dbo = db.db("matcha");
    var i = 0;
    var query = { User: email }

    dbo.collection("notifications").updateMany({ User: email }, { $set: { read: 1 } }, function (err, res) {
      if (err) throw err;
      console.log('read updated successfully');
    });

    dbo.collection("notifications").find(query).toArray(function (err, result) {
      if (err) throw err;
      // console.log(result);
      console.log('then display');

      result.forEach(function (user) {
        results[i] = user.notification;
        results[i]
        i++;
      });

      var len = results.length
      var finishRequest = function () {
        res.render('notifications', { len: len, results: results, name: user });
      }
      finishRequest();
    });


  });


});

router.post('/', function (req, res) {

  function e_mail(email) {
    var m = email.match(/@/i);
    if (!m)
      return false;
    return true;
  }

  function names(name, surname) {
    var namelen = name.length;
    var surlen = surname.length;

    if (namelen >= 2 && namelen <= 15 && surlen >= 2 && surlen <= 15)
      return true;
    return false;
  }

  function valid(pass) {
    var upper = pass.match(/[A-Z]/);
    var lower = pass.match(/[a-z]/);
    var num = pass.match(/[0-9]/);
    var special = pass.match(/[^\w]/);
    console.log(pass);

    console.log(upper, lower, num, special);

    if (!upper || !lower || !num || !special)
      return false;
    return true;
  }

  var name = req.body.firstname;
  var surname = req.body.secondname;

  if (name && surname) {
    var name = name.trim();
    var surname = surname.trim();
    var qName = name.toLowerCase(); //for searching purposes 
    var qSurname = surname.toLowerCase(); //for searching purposes 
  }

  var email = req.body.email.trim();
  var pass = req.body.password;
  var confirmPass = req.body.confirmpass;
  var birthday_day = req.body.birthday_day;
  var birthday_month = req.body.birthday_month;
  var birthday_year = req.body.birthday_year;
  var sub = req.body.submit;
  var errorType = null;

  //check if user doesn't exist

  //sign up
  if (sub === "Sign Up") {
    console.log(names(name, surname));

    if (birthday_day == 0 || birthday_month == 0 || birthday_year == 0) {
      console.log("birthday incomplete!");
      console.log(birthday_year);
      console.log(birthday_month);
      console.log(birthday_day);
    }
    else if (pass === confirmPass && valid(pass) && names(name, surname) && e_mail(email)) {
      console.log(birthday_year);
      var hashedPassword = passwordHash.generate(pass);
      var age = 2020 - birthday_year;
      var data = {
        "name": name,
        "surname": surname,
        "qName": qName,
        "qSurname": qSurname,
        "email": email,
        "password": hashedPassword,
        "birthday_day": birthday_day,
        "birthday_month": birthday_month,
        "birthday_year": birthday_year,
        "age": age,
        "verify": 0,
        "notifications": 1,
        "code": hashedPassword.substr(0, 9),
        "rating": 0,
        "activity": "offline"
      }

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("matcha");
        var exist = 0;

        //check if user exists
        dbo.collection("users").find().toArray(function (err, result) {
          if (err) throw err;
          result.forEach(function (user) {
            if (email === user.email) {
              console.log('email found');
              exist = 1;
            }

          });
          if (!exist) {
            dbo.collection('users').insertOne(data, async function (err, res) {
              if (err) throw err;
              await queryFunctions.profileSetUP(email);
              console.log("record inserted successfully!");
              console.log(hashedPassword);
              //db.close();
            });
            //send email
            function message() {
              var l1 = 'Your verification Code is ';
              var code = hashedPassword.substr(0, 9);
              var l3 = ', Please Click On ';
              var link = '<a href="http://localhost:8080/verify?email=' + email + '&code=' + code + '">this link</a>';//{}&code=">this link</a>';
              var l4 = ' to activate your account.';
              return l1 + code + l3 + link + l4;
            }

            var mailOptions = {
              from: 'auth@matcha.com',
              to: email,
              subject: 'Matcha Verification',
              html: message()
            };
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {

                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
            //redirect
            res.render('login', { name: "email sent" });
          }
          else {
            console.log('Email already in use!');
            var errorType = 'Email already in use!';
            res.render('index', { errorType: errorType });
          }
        });

        // });
      });
    } else {
      if (pass != confirmPass) {
        var errorType = "Passwords do not match";
        console.log("passwords do not match");
      }
      else if (!names(name, surname)) {
        var errorType = "Your name or surname must contain at least 2 characters";
        console.log("Your name or surname must contain at least 2 characters");
      }
      else if (!e_mail(email)) {
        var errorType = "Please enter a valid email address";
        console.log("Please enter a valid email");
      }
      else {
        var errorType = "Password does not match the required format";
        console.log("passwords does not match required format");
      }
      res.render('index', { errorType: errorType });

    }
  }
  //login
  else {
    var email = req.body.email;
    var password = req.body.password;
    var hashedPass = '';
    var verified = 0;

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("matcha");
      var query = { email: email };

      dbo.collection('users').findOne({ email: email }, function (err, user) {

        if (user != null) {
          hashedPass = user.password;
          verified = user.verify;
        }

        if (user === null) {
          errorType = "User not found!"
          console.log("User not found!");
          res.render("index", { errorType: errorType });
          // return res.status(400).send({message: "User not found"});
        }
        else if (!verified) {
          errorType = "Account not verified, please verify your account!";
          console.log("Please verify your account!");
          res.render('index', { errorType: errorType })
        }
        else if (passwordHash.verify(password, hashedPass)) {
          //create a user session
          req.session.user = user;
          /* global.variable = req.session.user;*/
          dbo.collection("users").updateOne({ email: req.session.user.email }, { $set: { activity: "Online" } }, function (err, act) {
            if (err) throw err;
          })
          console.log("logged in successfully!");
          //db.close();
          if (req.session.user.email)
            res.redirect('http://localhost:8080/home');
        }
        else {
          errorType = "Incorrect password!"
          console.log("Incorrect password!");
          res.render('index', { errorType: errorType });
        }
      });
    });
  }
});

module.exports = router;
