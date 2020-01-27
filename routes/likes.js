var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/', function(req, res){
    var name = req.session.user.name;
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("matcha");
        var query = {liked_user_mail:req.session.user.email};
        var names = new Array();
        var mail = new Array();
        var connected = new Array();
        var i = 0;

        dbo.collection("connections").find(query).toArray(function(err, result) {
            if (err) throw err;
            len = result.length;
            // console.log(result);
            result.forEach(function(user){
                mail[i] = user.user_mail;
                names[i] = user.user_name + ' ' + user.user_sname;
                connected[i] = user.connected;
                
                console.log(connected[i], i);
                
                if (connected[i] && i == len - 1){
                    console.log('here');
                    mail.pop();
                    names.pop();
                    connected.pop();
                    len--;
                }
                if (connected[i]){
                    len--;
                    i--;
                }
                i++;
            });
            res.render('likes', {name:name, names:names, mail:mail, len:len, connected:connected});
        });
    });
});

module.exports = router;