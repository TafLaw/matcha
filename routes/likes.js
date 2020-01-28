var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/', function(req, res){
    if (!req.session.user)
        res.redirect('http://localhost:8080/');
    var name = req.session.user.name;
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
        var query = {liked_user_mail:req.session.user.email};
        var names = new Array();
        var mail = new Array();
        var connected = new Array();
        var image = new Array();
        var blocked = new Array();
        var i = 0;

        function images(dbo, mail){
            i = 0;
            dbo.collection("profileimages").find().toArray(function(err, resu){
                // console.log(resu);
                // console.log(mail);
                resu.forEach(function(usr){
                    var user_email = usr.name;
                    var inc = mail.includes(user_email);
                    
                    if (inc){
                        image[i] = usr.pathinfo;
                        i++;
                    }
                });
                res.render('likes', {images:image, name:name, names:names, mail:mail, len:len, connected:connected}); 
            });
        }

        dbo.collection("connections").find(query).toArray(function(err, result) {
            if (err) throw err;
            len = result.length;
            // console.log(result);
            result.forEach(function(user){
                mail[i] = user.user_mail;
                names[i] = user.user_name + ' ' + user.user_sname;
                connected[i] = user.connected;
                images[i] = 0;
                blocked[i] = user.blocked;
                console.log(connected[i], i);
                
                if ((connected[i] || blocked[i]) && i == len - 1){
                    console.log('here');
                    mail.pop();
                    names.pop();
                    connected.pop();
                    images.pop;
                    len--;
                }
                if (connected[i] || blocked[i]){
                    len--;
                    i--;
                }
                i++;
            });
            images(dbo, mail);
            // res.render('likes', {name:name, names:names, mail:mail, len:len, connected:connected});
        });
    });
});

router.get('/connections', function(req, res){
    if (!req.session.user)
        res.redirect('http://localhost:8080/');
    var name = req.session.user.name;
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
        var query = {liked_user_mail:req.session.user.email};
        var names = new Array();
        var mail = new Array();
        var connected = new Array();
        var image = new Array();
        var i = 0;

        function images(dbo, mail){
            i = 0;
            dbo.collection("profileimages").find().toArray(function(err, resu){
                // console.log(resu);
                // console.log(mail);
                resu.forEach(function(usr){
                    var user_email = usr.name;
                    var inc = mail.includes(user_email);
                    
                    if (inc){
                        image[i] = usr.pathinfo;
                        i++;
                    }
                });
                res.render('connections', {images:image, name:name, names:names, mail:mail, len:len, connected:connected}); 
            });
        }

        dbo.collection("connections").find(query).toArray(function(err, result) {
            if (err) throw err;
            len = result.length;
            // console.log(result);
            result.forEach(function(user){
                mail[i] = user.user_mail;
                names[i] = user.user_name + ' ' + user.user_sname;
                connected[i] = user.connected;
                images[i] = 0;
                console.log(connected[i], i);
                
                if (!connected[i] && i == len - 1){
                    console.log('here');
                    mail.pop();
                    names.pop();
                    connected.pop();
                    images.pop;
                    len--;
                }
                if (!connected[i]){
                    len--;
                    i--;
                }
                i++;
            });
            images(dbo, mail);
            // res.render('likes', {name:name, names:names, mail:mail, len:len, connected:connected});
        });
    });
});

module.exports = router;