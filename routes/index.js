var express = require('express');
var router = express.Router();

/* GET home page. */
/* router.get('/', function(req, res, next) {
  console.log("Handled get request on the home page.");
  res.render('index', { title: 'TAF' });
});

router.post('/', (req, res, next) => {
   console.log("Handled a post request from the home page.");
}); */

router.get("/", function(req, res){
  res.render('index');
});

router.post('/', function(req, res){
  var name = req.body.firstname;
  var surname = req.body.secondname;
  var email = req.body.email;
  var sub = req.body.submit
  if (sub === "Sign Up")
      res.render('login', {name: "signup"});
  else
      res.render('login', {name: "login"});
  console.log(name);
  console.log(sub);
  console.log(surname);
  console.log(email);
});

module.exports = router;
