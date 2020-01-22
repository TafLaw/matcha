const express = require('express');
var router = express.Router();
const bodyparser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


//router.use(express.static("profimages"));

router.use(bodyparser.urlencoded({ extended: true }));
/* 
router.post("/gallery", function(req, res)
{
    if (req.body.saveupload == null)
    {
        console.log("The gallery images are being fixed");
        res.redirect('http://localhost:8080/profile');
    }
})
 */
router.post("/", function (req, res) {
    console.log(req.body);
    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/');
    }
    else {
        if (req.body.updateAbout == "updateAbout") {
            //console.log(req.body.aboutprofile.length);
            var string = req.body.aboutprofile.trim();
            console.log("Checkin How to trim");
            console.log(string);
            if (string.length == 0) {
                console.log("The about field is empty");
                //res.redirect('http://localhost:8080/profile');
            }
            else {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var myobject = { email: req.session.user.email, about: req.body.aboutprofile };
                    var newtext = { $set: { about: req.body.aboutprofile } };
                    var checktext = { email: req.session.user.email };
                    var updatetext = { email: req.session.user.email };

                    dbo.collection("profiletext").findOne(checktext, function (err, result) {
                        if (err) throw err;
                        console.log("this is the text that deserves updating Mthoko");
                        console.log(result);
                        if (result == undefined) {
                            dbo.collection("profiletext").insertOne(myobject, function (err, res) {
                                if (err) throw err;
                                console.log("Inserted about text");
                            });
                        }
                        else {
                            dbo.collection("profiletext").updateOne(updatetext, newtext, function (err, res) {
                                if (err) throw err;
                                console.log("updated about text");
                            });
                        }
                    });
                    // db.close();
                });
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateCity == "updateCity") {
            var string1 = req.body.city.trim();
            if (string1.length == 0) {
                console.log("The City field is empty");
            }
            else {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var myobject = { email: req.session.user.email, City: req.body.city };
                    var newcity = { $set: { City: req.body.city } };
                    var checkcity = { email: req.session.user.email };
                    var updatecity = { email: req.session.user.email };

                    dbo.collection("profileGeo").findOne(checkcity, function (err, result) {
                        if (err) throw err;
                        console.log("this is the text that deserves updating Mthoko");
                        console.log(result);
                        if (result == undefined) {
                            dbo.collection("profileGeo").insertOne(myobject, function (err, res) {
                                if (err) throw err;
                                console.log("Inserted about city");
                            });
                        }
                        else {
                            dbo.collection("profileGeo").updateOne(updatecity, newcity, function (err, res) {
                                if (err) throw err;
                                console.log("updated about city");
                            });
                        }
                    });
                    // db.close();
                });
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateName == "updateName") {
            console.log("changing name");
            var string2 = req.body.username.trim();
            if (string2.length == 0) {
                console.log("The Name field is empty");
            }
            else {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var user = { email: req.session.user.email };
                    var newname = { $set: { name: req.body.username } };

                    dbo.collection("users").updateOne(user, newname, function (err, res) {
                        if (err) throw err;
                        console.log("New Name");
                    });
                    dbo.collection("users").findOne(user, newname, function (err, user) {
                        if (err) throw err;
                        console.log("New Session");
                        req.session.user = user;
                    });
                    /*  req.session.save( function(err)
                     {
                         //if(err) throw err;
                     }); */
                });
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateSurname == "updateSurname") {
            console.log("updateSurname");
            var string3 = req.body.surname.trim();
            if (string3.length == 0) {
                console.log("The Surname field is empty");
            }
            else {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var user = { email: req.session.user.email };
                    var newsname = { $set: { surname: req.body.surname } };

                    dbo.collection("users").updateOne(user, newsname, function (err, res) {
                        if (err) throw err;
                        console.log("New Surname");
                    });
                    /* dbo.collection("users").findOne(user,newname, function(err,res)
                    {
                        if(err) throw err;
                        console.log("New Session");
                    }); */
                    // req.session.user = res;
                    /*  req.session.save( function(err)
                     {
                         //if(err) throw err;
                     }); */
                });
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateEmail == "updateEmail") {
            console.log("updateEmail");
            var string4 = req.body.email.trim();
            if (string4.length == 0) {
                console.log("The City field is empty");
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.saveAbout == "saveAbout") {
            console.log("updating inputs");

            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('matcha');
                var myobject = { email: req.session.user.email, sex: req.body.sex, race: req.body.race, gender: req.body.gender, height: req.body.height };
                var newori = { $set: { sex: req.body.sex, race: req.body.race, gender: req.body.gender, height: req.body.height } };
                var checkori = { email: req.session.user.email };

                dbo.collection("profile").findOne(checkori, function (err, resori) {
                    if (err) throw err;

                    if (resori == undefined) {
                        dbo.collection("profile").insertOne(myobject, function (err, res) {
                            if (err) throw err;
                            console.log("Inserted Select options");
                        });
                    }
                    else {
                        dbo.collection("profile").updateOne(checkori, newori, function (err, res) {
                            if (err) throw err;
                            console.log("updated Select options");
                        });
                    }

                });

                //db.close();
            });
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.About == "About") {
            console.log("About is Being Changed");
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("matcha");
                var profinfo = { email: req.session.user.email };
            });
            res.render('edit_profile', { username: req.session.user.name, surname: req.session.user.surname, email: req.session.user.email });
        }
        else if (req.body.Details == "Details") {
            console.log("Personal Details Are Being Changed")
            res.render('edit_profile', { username: req.session.user.name, surname: req.session.user.surname, email: req.session.user.email });
        }
        else if (req.body.Geolocation == "Geolocation") {
            console.log("Finding your current location");
            res.render('profile');
        }
        /*  else if (req.body.saveupload == null)
        {
            console.log("The gallery images are being fixed");
            console.log(req.body);
            res.redirect('http://localhost:8080/profile');
        }  */
        else if (req.body.upload == null) {
            /* the solution to problem is to say that do not update in th database if the
            the object is undefined as a whole;;;;;;;
            */
            var form = new formidable.IncomingForm();

            form.parse(req, function (err, fields, files) {
                var oldpath = files.fileuploaded.path;
                var newpath = __dirname.replace("routes", "public") + "/images/" + files.fileuploaded.name;
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
                    MongoClient.connect(url, function (err, db) {
                        if (err) throw err;
                        var dbo = db.db('matcha');
                        var checkimage = { name: req.session.user.email };
                        dbo.collection('profileimages').findOne(checkimage, function (err, cresult) {
                            if (err) throw err;
                            //imgname = cresult.name;

                            if (cresult != undefined) {
                                console.log("profile image alrady in");
                                MongoClient.connect(url, function (err, db) {
                                    if (err) throw err;
                                    var dbo = db.db('matcha');
                                    var updateimage = { name: req.session.user.email };
                                    var newimage = { $set: { pathinfo: "/images/" + files.fileuploaded.name } };
                                    dbo.collection('profileimages').updateOne(updateimage, newimage, function (err, res) {
                                        if (err) throw err;
                                        console.log('profile image updated');
                                    });
                                });
                                //  res.redirect('http://localhost:8080/profile');
                            }
                            else {
                                MongoClient.connect(url, function (err, db) {
                                    if (err) throw err;
                                    var dbo = db.db('matcha');
                                    var imagepath = { name: req.session.user.email, pathinfo: "/images/" + files.fileuploaded.name };
                                    dbo.collection('profileimages').insertOne(imagepath, function (err, res) {
                                        if (err) throw err;
                                        console.log("profile path saved!");
                                    });
                                });
                            }
                        });
                    });
                    /*  console.log("file has been moved");
                    console.log("profile redirected"); */
                    res.redirect('http://localhost:8080/profile');
                }
            });
        }
    }
}
);

router.post("/gallery", function (req, res) {
    console.log("The gallery is being Fixed");

    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var oldpath = files.fileuploaded.path;
        var newpath = __dirname.replace("routes", "public") + "/images/" + files.fileuploaded.name;
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

            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('matcha');
                var imagepath = { name: req.session.user.email, pathinfo: "/images/" + files.fileuploaded.name };
                dbo.collection('profileGallery').insertOne(imagepath, function (err, res) {
                    if (err) throw err;
                    console.log("profile path saved!");
                });
            });
            /*  console.log("file has been moved");
            console.log("profile redirected"); */
            res.redirect('http://localhost:8080/profile');
        }
    });
});

router.get("/music", function (req, res) {
    console.log("Umoya Wami uyavuma, Ewe moya Wami");
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("matcha");
        var newtag = { email: req.session.user.email, tag: "#music" };
        var checktag = { email: req.session.user.email, tag: "#music" };
        //check to remove tag;;;;;

        dbo.collection("profiletags").findOne(checktag, function (err, res) {
            if (err) throw err;
            console.log("Music Tags");
            console.log(res);
            if (res == undefined) {
                console.log("No Music tag");
                dbo.collection("profiletags").insertOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Inserted Music Tag");
                });
            }
            else {
                dbo.collection("profiletags").deleteOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Removed Music Tag");
                });
            }
        })
    });
    res.redirect('http://localhost:8080/profile');
});

router.get("/Sports", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("matcha");
        var newtag = { email: req.session.user.email, tag: "#Sports" };
        var checktag = { email: req.session.user.email, tag: "#Sports" };
        //check to remove tag;;;;;

        dbo.collection("profiletags").findOne(checktag, function (err, res) {
            if (err) throw err;
            console.log("Sports Tags");
            console.log(res);
            if (res == undefined) {
                console.log("No Sports tag");
                dbo.collection("profiletags").insertOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Inserted Sports Tag");
                });
            }
            else {
                dbo.collection("profiletags").deleteOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Removed Sports Tag");
                });
            }
        })
    });
    res.redirect('http://localhost:8080/profile');
});

router.get("/Food", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("matcha");
        var newtag = { email: req.session.user.email, tag: "#Food" };
        var checktag = { email: req.session.user.email, tag: "#Food" };
        //check to remove tag;;;;;

        dbo.collection("profiletags").findOne(checktag, function (err, res) {
            if (err) throw err;
            console.log("Food Tags");
            console.log(res);
            if (res == undefined) {
                console.log("No Food tag");
                dbo.collection("profiletags").insertOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Inserted Food Tag");
                });
            }
            else {
                dbo.collection("profiletags").deleteOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Removed Food Tag");
                });
            }
        })
    });
    res.redirect('http://localhost:8080/profile');
});

router.get("/Reading", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("matcha");
        var newtag = { email: req.session.user.email, tag: "#Reading" };
        var checktag = { email: req.session.user.email, tag: "#Reading" };
        //check to remove tag;;;;;

        dbo.collection("profiletags").findOne(checktag, function (err, res) {
            if (err) throw err;
            console.log("Reading Tags");
            console.log(res);
            if (res == undefined) {
                console.log("No Reading tag");
                dbo.collection("profiletags").insertOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Inserted Reading Tag");
                });
            }
            else {
                dbo.collection("profiletags").deleteOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Removed Reading Tag");
                });
            }
        })
    });
    res.redirect('http://localhost:8080/profile');
});

router.get("/Gaming", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("matcha");
        var newtag = { email: req.session.user.email, tag: "#Gaming" };
        var checktag = { email: req.session.user.email, tag: "#Gaming" };
        //check to remove tag;;;;;

        dbo.collection("profiletags").findOne(checktag, function (err, res) {
            if (err) throw err;
            console.log("Gaming Tags");
            console.log(res);
            if (res == undefined) {
                console.log("No Gaming tag");
                dbo.collection("profiletags").insertOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Inserted Gaming Tag");
                });
            }
            else {
                dbo.collection("profiletags").deleteOne(newtag, function (err, res) {
                    if (err) throw err;
                    console.log("Removed Gaming Tag");
                });
            }
        })
    });
    res.redirect('http://localhost:8080/profile');
});

/* router.post("/gallery", function(req, res)
{
   if (req.body.saveupload == null)
   {
       console.log("The gallery images are being fixed");
       res.redirect('http://localhost:8080/profile');
   }
}) */

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
    var sex = null;
    var race = null;
    var gender = null;
    var height = null;
    var img = null;
    var birthday = null;
    var cityn = null;
    var tags = new Array();
    var gallery = new Array();

    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/');
    }
    else {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            //console.log("connecting for profile");
            var dbo = db.db('matcha');

            var checkcity = { email: req.session.user.email };

            dbo.collection("profileGeo").find(checkcity).toArray(function (err, result5) {
                if (err) throw err;
                result5.forEach(function (cityname) {
                    cityn = cityname.City;
                })
            })

            var checkgall = { name: req.session.user.email };

            dbo.collection("profileGallery").find(checkgall).toArray(function (err, result7) {
                if (err) throw err;
                // console.log(result6[0]);
                //i = 0;
                //var res0 = new Array(result6[0]);
                console.log("Gallery");
                console.log(result7);
                var i = 0;

                result7.forEach(function (gname) {
                    gallery[i] = gname.pathinfo;
                    i++;
                    //console.log(tname.length);
                    //console.log("tags");
                    //console.log(tags);
                });
                console.log(gallery);
            })

            var checktags = { email: req.session.user.email };

            dbo.collection("profiletags").find(checktags).toArray(function (err, result6) {
                if (err) throw err;
                // console.log(result6[0]);
                //i = 0;
                //var res0 = new Array(result6[0]);
                console.log("tags");
                var i = 0;

                result6.forEach(function (tname) {
                    tags[i] = tname.tag;
                    i++;
                    //console.log(tname.length);
                    //console.log("tags");
                    //console.log(tags);
                });
                console.log(tags);
            })

            var query = { email: req.session.user.email };

            dbo.collection("users").find(query).toArray(function (err, result) {
                if (err) throw err;
                //console.log(result);
                //console.log("Myname");
                result.forEach(function (user) {
                    username1 = user.name + ' ' + user.surname;
                    birthday = user.birthday_day + ' ' + user.birthday_month + ' ' + user.birthday_year;
                    age = Number(17);
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
                    sex = userabout.sex;
                    race = userabout.race;
                    gender = userabout.gender;
                    height = userabout.height;
                });
                console.log(result2);
            }
            );

            var query4 = { name: req.session.user.email }

            dbo.collection("profileimages").find(query4).toArray(function (err, result4) {
                if (err) throw err;
                result4.forEach(function (image) {
                    img = image.pathinfo;
                    //console.log("mthomega" + image.pathinfo)
                });
                console.log("profile images");
                console.log(result4);
            }
            );

            var query2 = { email: req.session.user.email }

            dbo.collection("profiletext").find(query2).toArray(function (err, result3) {
                if (err) throw err;
                //console.log("result3"); 
                //console.log(result3);
                result3.forEach(function (textb) {
                    texta = textb.about;
                    console.log(texta);
                });
                //console.log(result3);

                console.log(username1 + "the nigga");
                if (texta == null) {
                    texta = '';
                }
                else if (img == null) {
                    //img = 'images/profile.jpg';
                    img = '';
                }
                else if (username1 == null) {
                    username1 = '';
                }
                else if (birthday == null) {
                    birthday = '';
                }
                else if (sex == null) {
                    sex = '';
                }
                else if (race == null) {
                    race = '';
                }
                else if (gender == null) {
                    gender = '';
                }
                else if (height == null) {
                    height = '';
                }
                else if (cityn == null) {
                    cityn = '';
                }
                else if (tags == null) {
                    tags = '';
                }
                else if (gallery == null)
                {
                    gallery = '';
                }
                console.log("This the user information");
                console.log(req.session);
                /*  dbo.collection("users").findOne({code: req.session.user.code}, function(err, user)
                 {
                     if(err) throw err;
                     //req.session.user = user;
                     console.log("rendered New session");
                 }) */
                /* req.session.regenerate(function(err)
                {
                    if (err) throw err;
                })
                console.log("This is the new sesssion check the session");
                console.log(req.session); */
                //console.log(req.session);

                res.render('profile', { username1: username1, imageu: img, birthday: birthday, age: age, text: texta, sex: sex, race: race, gender: gender, height: height, cityn: cityn, tags: tags, gallery: gallery, def: "images/profile.jpg"});
            });
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
        }
        if (username1 == null)
        {
            username1 = '';
        }
        else if(sex == null)
        {
            sex = '';
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
    }
});

/*
router.listen(3000, function () {
    console.log("Server Runnning on Port 3000");
}
); */
module.exports = router;