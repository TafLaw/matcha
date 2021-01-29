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
const { resolve } = require('path');
const { rejects } = require('assert');
const { response } = require('../app');
const { exit } = require('process');
var globalUserKey;
var geoip = require('geoip-lite');
const publicIp = require('public-ip');

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
        await profileSetUP(req.session.user.email);
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
            console.log("Came in for routing to details");
            res.redirect('http://localhost:8080/profile/edit_profile');
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
    await profileSetUP(req.session.user.email);
    console.log("removing images");
    var imageUrl = req.body.pathr;
    await deleteDB("DELETE FROM gallery WHERE imageUrl = ? AND profile_id = " + mysql.escape(globalUserKey), [[imageUrl]], "GALLERY");
    res.redirect('http://localhost:8080/profile');
});

router.post("/gallery", function (req, res) {

    var form = new formidable.IncomingForm();

    form.parse(req, async function (err, fields, files) {
        await profileSetUP(req.session.user.email);
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
            console.log('hwlebfwh4.nlfui4hwbe.f4jhwebgfilqh4be.rfnilqubjenf');
            console.log(await checkExistance("SELECT * FROM gallery WHERE imageUrl = "+mysql.escape(imageUrl)+" AND profile_id = "+ mysql.escape(globalUserKey),'',"GALLERY"));
            if (!await checkExistance("SELECT * FROM gallery WHERE imageUrl = "+mysql.escape(imageUrl)+" AND profile_id = "+ mysql.escape(globalUserKey),'',"GALLERY")) {
                await insertDB('INSERT INTO gallery (imageUrl,profile_id) VALUES ? ', [[imageUrl, globalUserKey]], "GALLERY");
            }
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
    }
    else {
        MongoClient.connect(url, function (err, db) {
            var dbo = db.db("matcha");
            if (err) throw err;
            dbo.collection("users").updateOne({ email: req.session.user.email }, { $set: { notifications: 1 } }, function (err, dan) {
                if (err) throw err;
            });
        });
    }
});

router.post("/view", async function (req, res) {
    console.log('hfnlw4fnljfnl3qhfnlj3n');
    console.log(req.body);
    await profile(req, res, req.body.hmail);
});

router.get("/music", async function (req, res) {
    await profileSetUP(req.session.user.email);
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
    await profileSetUP(req.session.user.email);
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
    await profileSetUP(req.session.user.email);
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT food FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].food == 0 || result[0].food == null ? true : false;
        console.log(globalUserKey);
        await updateDB("UPDATE activities SET food = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (food,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});

router.get("/Reading", async function (req, res) {
    await profileSetUP(req.session.user.email);
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
    await profileSetUP(req.session.user.email);
    if (await checkExistance("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES")) {
        result = await selectDB("SELECT gaming FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let value = result[0].gaming == 0 || result[0].gaming == null ? true : false;
        await updateDB("UPDATE activities SET gaming = ? WHERE profile_id = " + mysql.escape(globalUserKey), [[value]], "ACTIVITIES");
    } else {
        await insertDB("INSERT INTO activities (gaming,profile_id) VALUES ?", [[true, globalUserKey]], "ACTIVITIES");
    }
    res.redirect('http://localhost:8080/profile');
});


router.get('/location', async function (req, res) {
    await profileSetUP(req.session.user.email);
    console.log("I am in the insertion of the location of the user");

    let latitude = req.query.lat;
    let longitude = req.query.long;

    if (latitude.length == 0 && longitude.length == 0) {
        let ip = await publicIp.v4();
        let geo = geoip.lookup(ip);
        latitude = geo.ll[0];
        longitude = geo.ll[1];
    }
    if (await checkExistance("SELECT * FROM location WHERE profile_id = ? ", [[globalUserKey]], "LOCATION")) {
        await updateDB("UPDATE location SET latitude = (" + mysql.escape(latitude) + "),longitude = (" + mysql.escape(longitude) + ") WHERE profile_id = (" + mysql.escape(globalUserKey) + ")", "", "LOCATION");
    } else {
        await insertDB("INSERT INTO location (latitude,longitude,profile_id) VALUES ?", [[latitude, longitude, globalUserKey]], "LOCATION");
    }
    console.log(req.query);
    console.log(latitude);
    console.log(longitude);
});

router.get("/edit_profile", async function (req, res) {
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        let dbo = db.db("matcha");
        let profileData = await dbo.collection("users").findOne({ email: req.session.user.email });
        console.log('gfffffffffffffffffffffr');
        console.log(profileData);
        res.render('edit_profile', { profileData: profileData });
    });
});

router.get("/", async function (req, res) {
    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/')
    }
    await profile(req, res, req.session.user.email);
});

function validString(stringChecked) {
    if (stringChecked.trim().length == 0) {
        return false;
    }
    return true;
}

async function profile(req, res, email) {
    let username1 = null;
    let age = null;
    let marker = '/images/marker.png';
    let activity = "Online";
    let birthday = null;
    let tags = new Array();
    let gallery = new Array();
    let loves = new Array();
    let rating = 0;
    let mail;
    let notifications = 1;

    if (req.session.user == undefined) {
        res.redirect('http://localhost:8080/');
    }
    else {
        await profileSetUP(email);
        let data = await selectDB("SELECT * FROM profile WHERE profile_id = ?", [[globalUserKey]], "PROFILE");
        console.log(email);
        console.log(globalUserKey);
        console.log(data);
        let tagsData = await selectDB("SELECT * FROM activities WHERE profile_id = ?", [[globalUserKey]], "ACTIVITIES");
        let galleryData = await selectDB("SELECT * FROM gallery WHERE profile_id = ?", [[globalUserKey]], "GALLERY");
        let locationData = await selectDB("SELECT * FROM location WHERE profile_id = ? ", [[globalUserKey]], "LOCATION");
        let views;

        if (req.session.user.email == email) {
            views = await selectDB("SELECT * FROM views WHERE profile_id = ?", [[globalUserKey]], "VIEWS");
            console.log(views);
            mail = 1;
        } else {
            if (!await checkExistance("SELECT * FROM views WHERE email = ? AND profile_id = " + mysql.escape(globalUserKey), [[req.session.user.email]], "VIEWS")) {
                await insertDB("INSERT INTO views (user,email,profile_id) VALUES ?", [[`${req.session.user.name} ${req.session.user.surname}`, req.session.user.email, globalUserKey]], "VIEWS");
            }
            mail = 0;
        };

        for (const property in tagsData[0]) {
            if (property != 'id' && property != 'profile_id') {
                if (tagsData[0][property] == 1) {
                    tags.push(property);
                }
            }
        }

        for (const image in galleryData) {
            for (const url in galleryData[image]) {
                if (url == 'imageUrl') {
                    gallery.push(galleryData[image][url]);
                }
            }
        }

        MongoClient.connect(url, async function (err, db) {
            if (err) throw err;
            var dbo = db.db('matcha');

            var queryUser = { liked_user_mail: email };

            const response = dbo.collection("connections").find(queryUser);

            for (let connection = await response.next(); connection; connection = await response.next()) {
                console.log(connection);
                loves.push(connection.liked_user_mail);
                if (loves.length >= 10) {
                    rate = Number(10);
                }
                else {
                    rate = loves.length;
                }
                rating = (rate / 10) * 100;
            }

            var query = { email: email };

            const response1 = dbo.collection("users").find(query);

            for (let user = await response1.next(); user != null; user = await response1.next()) {
                username1 = user.name + ' ' + user.surname;
                birthday = user.birthday_day + ' ' + user.birthday_month + ' ' + user.birthday_year;
                age = user.age;
                notifications = user.notifications;
                activity = user.activity;
            }

            console.log("This the user information");
            console.log(Object.assign(data[0], locationData[0]));
            res.render('profile', { profileData: Object.assign(data[0], locationData[0]), username1: username1, birthday: birthday, age: age, tags: tags, gallery: gallery, activity: activity, mail: mail, marker: marker, notifications: notifications, views: views, rating: rating });
        });
    }
}

async function profileSetUP(email) {

    if (await checkExistance("SELECT * FROM profile WHERE email = ?", [[email]])) {
        results = await selectDB("SELECT * FROM profile WHERE email = ?", [[email]], "PROFILE");
        globalUserKey = results[0].profile_id;
        console.log("ID profile" + globalUserKey);
    } else {
        let value = [
            ['/images/profile.jpg', email],
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

module.exports = { router, selectDB, profileSetUP, mysql };