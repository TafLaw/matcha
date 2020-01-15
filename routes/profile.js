const express = require('express');
var router = express.Router();
const bodyparser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


//router.use(express.static("profimages"));

router.use(bodyparser.urlencoded({ extended: true }));

router.post("/", function (req, res) {
    console.log(req.body);
    if (req.body.updateAbout == "updateAbout") {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('matcha');
            var myobject = { email: req.session.user.email, about: req.body.aboutprofile }

            dbo.collection("profiletext").insertOne(myobject, function (err, res) {
                if (err) throw err;
                console.log("Inserted about text");
            });
            db.close();
        });
        res.render('profile');
    }
    else if (req.body.saveAbout == "saveAbout") {
        console.log("updating inputs");
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('matcha');
            var myobject = { email: req.session.user.email, diet: req.body.diet, race: req.body.race, gender: req.body.gender, height: req.body.height }

            dbo.collection("profile").insertOne(myobject, function (err, res) {
                if (err) throw err;
                console.log("Inserted Select options");
            });
            db.close();
        });
        res.render('profile');
    }
    else if (req.body.About == "About") {
        console.log("About is Being Changed")
        res.render('edit_profile');
    }
    else if (req.body.Details == "Details") {
        console.log("Personal Details Are Being Changed")
        res.render('edit_profile');
    }
    else if (req.body.Take == "Take") {
        console.log("Taking image");
        //res.sendFile(__dirname + "/profile.ejs");
        //text = {text: "mthoko"};
        res.render('profile');
    }
    else if (req.body.Geolocation == "Geolocation") {
        console.log("Finding your current location");
        res.render('profile');
    }
    else if (req.body.upload == null) {
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {
            var oldpath = files.fileuploaded.path;
            var newpath = __dirname.replace("routes","public") + "/images/" + files.fileuploaded.name;
            if (files.fileuploaded.size == 0) {
                console.log("file field is empty");
               //res.redirect('http://localhost:8080/profile');
              // res.render('profile');
            }
            else {
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                   // console.log(newpath);
                });
                MongoClient.connect(url, function(err, db)
                {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var imagepath = {name: req.session.user.email, pathinfo: "/images/" + files.fileuploaded.name};
                    dbo.collection('profileimages').insertOne(imagepath, function(err, res)
                    {
                        if(err) throw err;
                        console.log("profile path saved!");
                    })
                })
                console.log("file has been moved");
            }
            res.redirect('http://localhost:8080/profile');
        });
    }
}
);

/* router.post("/uploadprofile", function (req, res) {
   var form = new formidable.IncomingForm();

   form.parse(req, function (err, fields, files) {
       var oldpath = files.fileuploaded.path;
       var newpath = __dirname.replace("routes", "public") + "/images/" + files.fileuploaded.name;
       fs.rename(oldpath, newpath, function (err) {
           if (err) throw err;
           console.log(newpath);
           console.log("file has been moved");
       }
       );
       res.end();
   }); 
});*/

router.get("/", function (req, res) {
    var username1 = null;
    var texta = null;
    var age = null;
    var diet = null;
    var race = null;
    var gender = null;
    var height = null;
    var img = null;

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        //console.log("connecting for profile");
        var dbo = db.db('matcha');

        var query = { email: req.session.user.email };

        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;
            //console.log(result);
            //console.log("Myname");
            result.forEach(function (user) {
                username1 = user.name;
                //age = Number(17);
            })
            //console.log(username1);
        }
        );

        //the about text reqiures sessions

        /* var q = {_id: "5dfa32768d809f7317c01cf8"};
        {about:}
        
        dbo.collection("profile").find(q).toArray(function (err, result1) {
            if (err) throw err;
            result1.forEach(function (about) {
                text = about.text;
            });
            console.log("result1")
            console.log(result1);
        }
        );  */

        var query1 = { email: req.session.user.email }

        dbo.collection("profile").find(query1).toArray(function (err, result2) {
            if (err) throw err;
            result2.forEach(function (userabout) {
                diet = userabout.diet;
                race = userabout.race;
                gender = userabout.gender;
                height = userabout.height;
            });
            //console.log(result2);
        }
        );

        var query4 = { name: req.session.user.email }

        dbo.collection("profileimages").find(query4).toArray(function(err, result4) {
            if (err) throw err;
            result4.forEach(function (image) {
                img = image.pathinfo;
                //console.log("mthomega" + image.pathinfo)
            });
            console.log("mthomega" + img);
        }
        );

        var query2 = { email: req.session.user.email }

        dbo.collection("profiletext").find(query2).toArray(function (err, result3) {
            if (err) throw err;
            //console.log("result3"); 
            //console.log(result3);
            result3.forEach(function (textb) {
                texta = textb.about;
            });
            //console.log(result3);
            console.log(username1 + "the nigga");
            res.render('profile', { username1: username1 ,imageu: img/*age: age  text: texta */ /* , diet: diet, race: race, gender: gender, height: height */ });
        }
        );
        db.close();
    });

    /*  var geolocation = require('geolocation')
    
    geolocation.getCurrentPosition(function (err, position) {
        if (err) throw err
        console.log(position)
    }) */
    /* if (texta == null) {
        console.log("whats wrong");
        console.log(username1);
    } */
    //console.log(diet);

    /* if (username1 == null)
    {
        username1 = '';
    }
    else if(diet == null)
    {
        diet = '';
    }
    else if (race == null)
    {
        race = '';
    }
    else if(gender == null)
    {
        gender = '';
    }
    else if (height == null)
    {
        height = '';
    }
    else if(text == null)
    {
        text = '';
    }*/
    //  username1 = "Mthokozisi";
});

/*
router.listen(3000, function () {
    console.log("Server Runnning on Port 3000");
}
); */
module.exports = router;