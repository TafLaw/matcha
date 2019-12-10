const express = require("express");
const app = express();

app.set('view engine', 'ejs');
var test = "this is a test";
app.use(express.static('public'));
app.get("/", function(req, res){
    res.render('register', {test: test});
});

app.listen(8080);