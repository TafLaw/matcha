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
    if (req.body.updateAbout == "updateAbout")
    {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('matcha');
            var myobject = {about: req.body.aboutprofile}

            dbo.collection("profile").insertOne(myobject, function(err, res)
            {
                if(err) throw err;
                console.log("Inserted about text");
            });
            db.close();
        });
        res.render('profile');
    }
    else if(req.body.saveAbout == "saveAbout")
    {
        console.log("updating inputs");
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('matcha');
            var myobject = {diet: req.body.diet , race: req.body.race, gender: req.body.gender, height: req.body.height}

            dbo.collection("profile").insertOne(myobject, function(err, res)
            {
                if(err) throw err;
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
    else if (req.body.upload == undefined) {
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {
            var oldpath = files.fileuploaded.path;
            var newpath = __dirname.replace("routes","public") + "/images/" + files.fileuploaded.name;
            fs.rename(oldpath, newpath, function(err)
            {
                if(err) throw err;
                console.log(newpath);
                console.log("file has been moved");
            }
            );
            res.end();
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
    MongoClient.connect(url, function (err, db) {
        if (err) throw err; 
        //console.log("connecting for profile");
        var dbo = db.db('matcha');
        dbo.createCollection("profile", function(err,res)
        {
            if(err) throw err;
            console.log("profile colection created");
        });
        
        var query = { name: "Mthokozisi" };
        
        dbo.collection("users").find(query).toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function (userlog) {
                username = userlog.name;
                age = Number(17);
            })
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
        
    var query1 = {height: "1"}
        
        dbo.collection("profile").find(query1).toArray(function (err, result2) {
            if (err) throw err;
            result2.forEach(function (userabout) {
                diet = userabout.diet;
                race = userabout.race;
                gender = userabout.gender;
                height = userabout.height;
            });
            console.log(result2);
        }
        );
        db.close();
    }
    );

    var text = "Thank you God for the love and Grace...";

   /*  var geolocation = require('geolocation')
 
geolocation.getCurrentPosition(function (err, position) {
  if (err) throw err
  console.log(position)
}) */
    
    res.render('profile' , { username: username, age: age, text: text , diet: diet, race: race, gender: gender, height: height});
});

/*
router.listen(3000, function () {
    console.log("Server Runnning on Port 3000");
}
); */
module.exports = router;