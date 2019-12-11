const express = require("express");
const app = express();
// const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

app.set('view engine', 'ejs');
var test = "this is a test";
app.use(express.static('public'));
// app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));

app.get("/", function(req, res){
    res.render('register', {test: test});
});

app.post('/', function(req, res){
    var name = req.body.firstname;
    var surname = req.body.secondname;
    var email = req.body.email;
    console.log(name);
    console.log(surname);
    console.log(email);
    res.render('about', {name: name});
});

/* app.post('/register', function(req, res){

}); */

app.listen(8080);