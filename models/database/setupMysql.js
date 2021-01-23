const { rejects } = require('assert');
var mysql = require('mysql');
const { resolve } = require('path');


async function createDB() {
    return new Promise((resolve,rejects) => {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "password"
        });
    
        con.connect(function (err) {
            if (err) throw err;
            console.log('Connected!');
            con.query("CREATE DATABASE IF NOT EXISTS matcha", function (err, result) {
                if (err) throw err;
                console.log('DATABASE CREATED!');
                resolve();
            });
        });
    });
}

async function createTables() {
   await createDB();

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "matcha_db"
    });

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = `CREATE TABLE IF NOT EXISTS profile (
            profile_id INT AUTO_INCREMENT PRIMARY KEY,
            about VARCHAR(255),
            city VARCHAR(255), 
            image VARCHAR(255), 
            email VARCHAR(255), 
            sexualPreference ENUM('male','female','other'), 
            race ENUM('african','white','indian','asian','other'), 
            gender ENUM('male','female','other'), 
            height ENUM('short','average','tall')
        )`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log('profile created!');
        });
        let sql1 = `CREATE TABLE IF NOT EXISTS gallery (
            id INT AUTO_INCREMENT PRIMARY KEY,
            imageUrl VARCHAR(255) NOT NULL,
            profile_id INT,
            CONSTRAINT fk_gallery
            FOREIGN KEY (profile_id)
            REFERENCES profile(profile_id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        )`;
        con.query(sql1,function(err,result){
            if(err) throw err;
            console.log('gallery created!');
        });

        let sql2 = `CREATE TABLE IF NOT EXISTS location (
            id INT AUTO_INCREMENT PRIMARY KEY,
            latitude DECIMAL(65,30),
            longitude DECIMAL(65,30),
            profile_id INT,
            CONSTRAINT fk_location
            FOREIGN KEY (profile_id)
            REFERENCES profile(profile_id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        )`;
        con.query(sql2,function(err,result){
            if(err) throw err;
            console.log('location created!');
        });

        let sql3 = `CREATE TABLE IF NOT EXISTS activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            music BOOLEAN,
            sports BOOLEAN,
            reading BOOLEAN,
            gaming BOOLEAN,
            food BOOLEAN,
            profile_id INT,
            CONSTRAINT fk_activities
            FOREIGN KEY (profile_id)
            REFERENCES profile(profile_id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        )`;
        con.query(sql3,function(err,result){
            if(err) throw err;
            console.log('activities created!');
        });

        let sql4 = `CREATE TABLE IF NOT EXISTS views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            profile_id INT,
            CONSTRAINT fk_views
            FOREIGN KEY (profile_id)
            REFERENCES profile(profile_id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        )`;
        con.query(sql4,function(err,result){
            if(err) throw err;
            console.log('views created!');
        });
    });
}

async function createConn() {
    return new Promise((resolve,rejects) => {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "password",
            database: "matcha_db"
        });
    
        con.connect(function (err) {
            if (err) throw err;
            console.log('Connected!');
        });
        resolve(con);
    });
}

// createTables();

module.exports = { createTables , createConn };