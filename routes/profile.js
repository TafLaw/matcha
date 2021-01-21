const express = require('express');
var router = express.Router();
var mysql = require('mysql');
const mysqlConn = require('./routes/../../models/database/setupMysql');
const bodyparser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const isImage = require('is-image');
var nodemailer = require("nodemailer");
var MongoClient = require('mongodb').MongoClient;
const { type } = require('os');
var url = "mongodb://localhost:27017/";
var ip = require('ip');
const { resolve } = require('path');
const { rejects } = require('assert');
const { response } = require('../app');
var globalUserKey;

//for sending an email
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jj646019@gmail.com',
        pass: 'drgtcfuavjuacakd'
    }
});

router.use(bodyparser.urlencoded({ extended: true }));

router.post("/", async function (req, res) {
    console.log(req.body);
    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/');
    }
    else {
        if (req.body.updateAbout == "updateAbout") {
            if (validString(req.body.aboutprofile)) {
                await updateDB('UPDATE profile SET about = ? WHERE profile_id = ' + mysql.escape(globalUserKey), [[req.body.aboutprofile.trim()]], "PROFILE");
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateCity == "updateCity") {
            if (validString(req.body.city)) {
                await updateDB('UPDATE profile SET city = ? WHERE profile_id = ' + mysql.escape(globalUserKey), [[req.body.city.trim()]], "PROFILE");
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateName == "updateName") {
            if (validString(req.body.username)) {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var user = { email: req.session.user.email };
                    var newname = { $set: { name: req.body.username.trim() } };

                    dbo.collection("users").updateOne(user, newname, function (err, res) {
                        if (err) throw err;
                        console.log("New Name");
                    });
                    dbo.collection("users").findOne(user, newname, function (err, user) {
                        if (err) throw err;
                        console.log("New Session");
                    });
                });
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateSurname == "updateSurname") {
            if (validString(req.body.surname)) {
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('matcha');
                    var user = { email: req.session.user.email };
                    var newsname = { $set: { surname: req.body.surname.trim() } };

                    dbo.collection("users").updateOne(user, newsname, function (err, res) {
                        if (err) throw err;
                        console.log("New Surname");
                    });
                });
            }
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.updateEmail == "updateEmail") {
            if (!validString(req.body.email)) {
                res.redirect('http://localhost:8080/profile');
            }
            else {
                var email = req.body.email.trim();
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("matcha");
                    var checkUserEmail = { email: email };

                    dbo.collection("users").findOne(checkUserEmail, function (err, result) {
                        if (err) throw err;
                        console.log("Looking for email in users");
                        if (result == undefined) {
                            MongoClient.connect(url, function (err, db) {
                                if (err) throw err;
                                var dbo = db.db("matcha");
                                var sessionEmail = req.session.user.email.trim();
                                var search = { email: sessionEmail };
                                var userUpdate = { $set: { email: req.body.email.trim(), verify: 0 } };

                                dbo.collection("users").findOne(search, function (err, result) {
                                    if (err) throw err;

                                    console.log("result");
                                    console.log(result);

                                    hashedPassword = result.password;
                                    code = result.code;

                                    //sending email
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
                                })

                                dbo.collection("connections").updateMany({ user_mail: sessionEmail }, { $set: { user_mail: email } }, function (err, res) {
                                    if (err) throw err;
                                    console.log("user email connections updated");
                                });

                                dbo.collection("notifications").updateMany({ user: sessionEmail }, { $set: { user: email } }, function (err, result) {
                                    if (err) throw err;
                                    console.log("user email notifications updated");
                                });

                                dbo.collection("users").updateOne(search, userUpdate, function (err, res) {
                                    if (err) throw err;
                                    console.log("user email updated");
                                });
                            });
                        }
                        else {
                            console.log("Email already in use");
                            res.redirect('http://localhost:8080/profile');
                        }
                    });
                });
                await updateDB('UPDATE profile SET email = ? WHERE profile_id = ' + mysql.escape(globalUserKey), [[email]], "PROFILE");
                res.redirect('http://localhost:8080/');
            }
        }
        else if (req.body.saveAbout == "saveAbout") {

            let sql = `UPDATE profile SET sexualPreference = ("${req.body.sex.toLowerCase()}") ,race = ("${req.body.race.toLowerCase()}") ,gender = ("${req.body.gender.toLowerCase()}"), height = ("${req.body.height.toLowerCase()}") WHERE profile_id = `;

            await updateDB(sql + mysql.escape(globalUserKey), '', "PROFILE");
            res.redirect('http://localhost:8080/profile');
        }
        else if (req.body.About == "About") {
            console.log("About is Being Changed");
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("matcha");
                var profinfo = { email: req.session.user.email };
                var pname;
                var psurname;
                var pemail;

                dbo.collection("users").findOne(profinfo, function (err, see) {
                    if (err) throw err;
                    pname = see.name;
                    psurname = see.surname;
                    pemail = see.email;

                    res.render('edit_profile', { username: pname, surname: psurname, email: pemail });
                })
            });
        }
        else if (req.body.Details == "Details") {
            console.log("Personal Details Are Being Changed")
            MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db("matcha");
                var profinfo = { email: req.session.user.email };
                var pname;
                var psurname;
                var pemail;

                dbo.collection("users").findOne(profinfo, function (err, see) {
                    if (err) throw err;
                    pname = see.name;
                    psurname = see.surname;
                    pemail = see.email;

                    res.render('edit_profile', { username: pname, surname: psurname, email: pemail });
                });
            });
        }
        else if (req.body.Geolocation == "Geolocation") {
            console.log("Finding your current location");
            res.render('profile');
        }
        else if (req.body.upload == null) {
            var form = new formidable.IncomingForm();

            form.parse(req, async function (err, fields, files) {
                var oldpath = files.fileuploaded.path;
                var newpath = __dirname.replace("routes", "public") + "/images/" + files.fileuploaded.name;
                var imgUrl = "/images/" + files.fileuploaded.name;
                if (files.fileuploaded.size == 0 || isImage(files.fileuploaded.name) == false) {
                    res.redirect('http://localhost:8080/profile');
                }
                else {
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                    });
                    await updateDB('UPDATE profile SET image = ? WHERE profile_id = ' + mysql.escape(globalUserKey), [[imgUrl]], "PROFILE");
                    res.redirect('http://localhost:8080/profile');
                }
            });
        }
    }
});

router.post("/remove", async function (req, res) {
    console.log("removing images");
    var imageUrl = req.body.pathr;
    await deleteDB("DELETE FROM gallery WHERE imageUrl = ? AND profile_id = " + mysql.escape(globalUserKey), [[imageUrl]], "GALLERY");
    res.redirect('http://localhost:8080/profile');
});

router.post("/gallery", function (req, res) {

    var form = new formidable.IncomingForm();

    form.parse(req, async function (err, fields, files) {
        var oldpath = files.fileuploaded.path;
        var newpath = __dirname.replace("routes", "public") + "/images/" + files.fileuploaded.name;
        var imageUrl = "/images/" + files.fileuploaded.name;

        if (files.fileuploaded.size == 0 || isImage(files.fileuploaded.name) == false) {
            res.redirect('http://localhost:8080/profile');
        }
        else {
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
            });

            await insertDB('INSERT INTO gallery (imageURL,profile_id) VALUES ? ', [[imageUrl, globalUserKey]], "GALLERY");
            res.redirect('http://localhost:8080/profile');
        }
    });
});


router.post("/notify", function (req, res) {
    if (req.body.notifynum == 1) {
        MongoClient.connect(url, function (err, db) {
            var dbo = db.db("matcha");
            if (err) throw err;
            dbo.collection("users").updateOne({ email: req.session.user.email }, { $set: { notifications: 0 } }, function (err, dan) {
                if (err) throw err;
            });
        });
        res.redirect('http://localhost:8080/profile');
    }
    else {
        MongoClient.connect(url, function (err, db) {
            var dbo = db.db("matcha");
            if (err) throw err;
            dbo.collection("users").updateOne({ email: req.session.user.email }, { $set: { notifications: 1 } }, function (err, dan) {
                if (err) throw err;
            });
        });
        res.redirect('http://localhost:8080/profile');
    }
});


//Profiles view Point/////////
router.post("/view", function (req, res) {
    /* copy the code from the profile and set email according to hidden input and make the if conditioin for mail to be visible in certain conditions */
    var username1 = null;
    var texta = null;
    var age = null;
    var sex = null;
    var race = null;
    var gender = null;
    var height = null;
    var lat = null;
    var long = null;
    var img = '/images/profile.jpg';
    var marker = '/images/marker.png';
    var activity = null;
    var birthday = null;
    var cityn = null;
    var tags = new Array();
    var gallery = new Array();
    var loves = new Array();
    var vies = new Array();
    var rate = 0;
    var mail = 1;

    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/');
    }
    else {
        if (req.session.user.email != req.body.hmail) {
            mail = 0;
        }
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            //console.log("connecting for profile");
            var dbo = db.db('matcha');

            /* write code to check where user is already in users if not insert else continue to other queries */

            var li_user = { user_view: req.session.user.email, user_account: req.body.hmail };

            dbo.collection("profileviews").findOne(li_user, function (err, vie) {
                if (err) throw err;
                if (vie == undefined) {
                    dbo.collection("profileviews").insertOne({ user_view_name: req.session.user.name + ' ' + req.session.user.surname, user_view: req.session.user.email, user_account: req.body.hmail }, function (err, succ) {
                        if (err) throw err;
                    })
                }
            });

            var query4 = { name: req.body.hmail }

            dbo.collection("profileimages").findOne(query4, function (err, result4) {
                if (err) throw err;
                if (result4 != undefined) {
                    if (req.body.hmail == result4.name) {
                        img = result4.pathinfo;
                    }
                }
                //console.log("mthomega" + image.pathinfo)
                console.log("profile images");
                console.log(result4);
            });

            var l_user = { liked_user_mail: req.body.hmail };

            dbo.collection("connections").find(l_user).toArray(function (err, ress) {
                if (err) throw err;
                var x = 0;

                ress.forEach(function (love) {
                    loves[x] = love.liked_user_mail;
                    x++;
                })
                if (loves.length >= 10) {
                    rate = Number(10);
                }
                else {
                    rate = loves.length;
                }
                //console.log("love");
                //console.log(rate);
                /* console.log("rate");
                console.log(rate); */
            });


            var checkcity = { email: req.body.hmail };

            dbo.collection("profileGeo").find(checkcity).toArray(function (err, result5) {
                if (err) throw err;
                result5.forEach(function (cityname) {
                    cityn = cityname.City;
                    lat = cityname.lat;
                    long = cityname.long;
                })
            })

            var checkgall = { name: req.body.hmail };

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

            var checktags = { email: req.body.hmail };

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

            var query = { email: req.body.hmail };

            dbo.collection("users").find(query).toArray(function (err, result) {
                if (err) throw err;
                //console.log(result);
                //console.log("Myname");
                result.forEach(function (user) {
                    username1 = user.name + ' ' + user.surname;
                    birthday = user.birthday_day + ' ' + user.birthday_month + ' ' + user.birthday_year;
                    age = user.age;
                    activity = user.activity;
                })
                //console.log(username1);
            }
            );

            var query1 = { email: req.body.hmail }

            dbo.collection("profile").find(query1).toArray(function (err, result2) {
                if (err) throw err;
                if (result2 != undefined) {
                    sex = result2.sex;
                    race = result2.race;
                    gender = result2.gender;
                    height = result2.height;
                }
                console.log(result2);
            });

            var query2 = { email: req.body.hmail }

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
                /* else if (img == null || img === undefined) {
                    img = 'images/profile.jpg';
                    //img = '';
                } */
                else if (username1 == null) {
                    username1 = '';
                }
                else if (birthday == null) {
                    birthday = '';
                }
                else if (lat == null) {
                    lat = '';
                }
                else if (long == null) {
                    long == '';
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
                else if (gallery == null) {
                    gallery = '';
                }
                console.log("This the user information");
                console.log(req.session);
                console.log(img);

                /*  dbo.collection("connections").updateMany({liked_user_mail: req.body.hmail },{$set: { rating: (rate/10) * 100}}, function(err, res)
                 {
                         if(err) throw err;
                         console.log("rating updated");
                 }); */

                res.render('profile', { username1: username1, imageu: img, birthday: birthday, age: age, text: texta, sex: sex, race: race, gender: gender, height: height, cityn: cityn, tags: tags, gallery: gallery, activity: activity, mail: mail, marker: marker, lat: lat, long: long, vies: vies, rating: (rate / 10) * 100, def: "images/profile.jpg" });
            });
            //db.close();
        });
    }
});

router.get("/music", async function (req, res) {
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT music FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].music == 0 || result[0].music == null ? true : false;
        await updateDB("UPDATE activities SET music = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (music,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});

router.get("/Sports", async function (req, res) {
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT sports FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].sports == 0 || result[0].sports == null ? true : false;
        await updateDB("UPDATE activities SET sports = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (sports,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});

router.get("/Food", async function (req, res) {
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT food FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].food == 0 || result[0].food == null ? true : false;
        await updateDB("UPDATE activities SET food = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (food,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});

router.get("/Reading", async function (req, res) {
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT reading FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].reading == 0 || result[0].reading == null ? true : false;
        await updateDB("UPDATE activities SET reading = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (reading,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});

router.get("/Gaming", async function (req, res) {
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT gaming FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].gaming == 0 || result[0].gaming == null ? true : false;
        await updateDB("UPDATE activities SET gaming = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (gaming,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});


router.get('/geofin', function (req, res) {
    console.log("I am in the insertion of the location of the user");
    console.log(res.query);

    MongoClient.connect(url, function (err, db) {
        var dbo = db.db("matcha");
        var gsearch = { email: req.session.user.email };
        var gupdate = { $set: { lat: req.query.lat, long: req.query.long } };
        var ginsert = { lat: req.query.lat, long: req.query.long };

        if (err) throw err;

        dbo.collection("profileGeo").findOne(gsearch, function (err, fin) {
            if (err) throw err;

            if (fin == undefined) {
                dbo.collection("profileGeo").insertOne(ginsert, function (err, ok) {
                    if (err) throw err;
                })
            }
            else {
                dbo.collection("profileGeo").updateOne(gsearch, gupdate, function (err, ok) {
                    if (err) throw err;
                })
            }
        })

    });
    res.redirect('http://localhost:8080/profile');
})

router.get("/", async function (req, res) {
    var username1 = null;
    var age = null;
    var lat = null;
    var long = null;
    var marker = 'images/marker.png';
    var activity = "Online";
    var birthday = null;
    var tags = new Array();
    var gallery = new Array();
    var loves = new Array();
    var vies = new Array();
    var rate = 0;
    var mail = 1;
    var notifications = 1;

    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/');
    }
    else {
        await profileSetUP(req);
        let data = await selectDB("SELECT * FROM profile WHERE profile_id = ?", [[globalUserKey]], "PROFILE");
        let tagsData = await selectDB("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let galleryData = await selectDB("SELECT * FROM gallery WHERE profile_id = ?", [[globalUserKey]], "GALLERY");

        for (const property in tagsData[0]) {
            if (property != 'id' && property != 'profile_id') {
                if (tagsData[0][property] == 1) {
                    tags.push(property);
                }
            }
        }

        for (const image in galleryData[0]) {
            if (image == 'imageUrl') {
                gallery.push(galleryData[0][image]);
            }
        }

        MongoClient.connect(url, async function (err, db) {
            if (err) throw err;
            var dbo = db.db('matcha');

            const response = dbo.collection("profileviews").find({ user_account: req.session.user.email });

            for (let doc = await response.next(); doc; doc = await response.next()) {
                console.log(doc);
            }


            var l_user = { liked_user_mail: req.session.user.email };

            const response1 = dbo.collection("connections").find(l_user);
            // .toArray(function (err, ress) {
            //     if (err) throw err;
            //     var x = 0;

            //     ress.forEach(function (love) {
            //         loves[x] = love.liked_user_mail;
            //         x++;
            //     })
            //     if (loves.length >= 10) {
            //         rate = Number(10);
            //     }
            //     else {
            //         rate = loves.length;
            //     }
            // });

            for (let doc = await response1.next(); doc; doc = await response1.next()) {
                console.log(doc);
            }
            1

            var checkcity = { email: req.session.user.email };

            const response2 = dbo.collection("profileGeo").find(checkcity);
            // .toArray(function (err, result5) {
            //     if (err) throw err;
            //     result5.forEach(function (cityname) {
            //         lat = cityname.lat;
            //         long = cityname.long;
            //     })
            // });

            for (let doc = await response2.next(); doc; doc = await response2.next()) {
                console.log(doc);
            }

            var query = { email: req.session.user.email };

            const response5 = dbo.collection("users").find(query);

            for (let user = await response5.next(); user != null; user = await response5.next()) {
                username1 = user.name + ' ' + user.surname;
                birthday = user.birthday_day + ' ' + user.birthday_month + ' ' + user.birthday_year;
                age = user.age;
                notifications = user.notifications;
            }

            console.log("This the user information");
            console.log(req.session);
            console.log(data);
            res.render('profile', { profileData: data[0], username1: username1, birthday: birthday, age: age, tags: tags, gallery: gallery, activity: activity, mail: mail, marker: marker, notifications: notifications, lat: lat, long: long, vies: vies, rating: (rate / 10) * 100, def: "images/profile.jpg" });
        });
    }
});

function getUserIP() {
    return ip.address();
}

function validString(stringChecked) {
    if (stringChecked.trim().length == 0) {
        return false;
    }
    return true;
}

async function profileSetUP(req) {

    if (await checkExistance("SELECT * FROM profile WHERE email = ?", [[req.session.user.email]])) {
        results = await selectDB("SELECT * FROM profile WHERE email = ?", [[req.session.user.email]], "PROFILE");
        globalUserKey = results[0].profile_id;
        console.log("ID profile" + globalUserKey);
    } else {
        let value = [
            ['images/profile.jpg', req.session.user.email],
        ]
        results = await insertDB("INSERT INTO profile(image,email) VALUES ? ", value, "PROFILE");
        globalUserKey = results.insertId;
        console.log("ID profile" + globalUserKey);
    }
}

async function checkExistance(sql, values) {
    const connection = await mysqlConn.createConn();
    return new Promise((resolve, rejects) =>
        connection.query(sql, [values], function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            if (result.length == 0) {
                resolve(false);
            }
            resolve(true);
        })
    );
}

async function insertDB(sql, values, table) {
    const connection = await mysqlConn.createConn();

    return new Promise((resolve, rejects) =>
        connection.query(sql, [values], function (err, result, fields) {
            if (err) throw err;
            console.log("Successfully Inserted into table " + table);
            resolve(result);
        })
    );

}

async function updateDB(sql, values, table) {
    const connection = await mysqlConn.createConn();

    return new Promise((resolve, rejects) =>
        connection.query(sql, [values], function (err, result, fields) {
            if (err) throw err;
            console.log("Successfully updated " + table);
            resolve(result);
        })
    );

}

async function selectDB(sql, values, table) {
    const connection = await mysqlConn.createConn();

    return new Promise((resolve, rejects) =>
        connection.query(sql, [values], function (err, result, fields) {
            if (err) throw err;
            console.log("Successfully selected data from " + table);
            resolve(result);
        })
    );
}

async function deleteDB(sql, values, table) {
    const connection = await mysqlConn.createConn();

    return new Promise((resolve, rejects) =>
        connection.query(sql, [values], function (err, result, fields) {
            if (err) throw err;
            console.log("Successfully deleted data from " + table);
            resolve(result);
        })
    );
}

module.exports = router;