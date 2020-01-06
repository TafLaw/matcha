var express = require('express');
var router = express.Router();
var formidable = require("formidable");

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user){
    console.log(req.session.user);
      console.log("Handled get request on the home page.");

  }
  else{
    console.log(req.session.user);
      console.log("Not defined!");
  }
  // res.render('login', { title: 'TAF' });
});

router.post('/', (req, res, next) => {
   console.log("Handled a post request from the home page.");
});

module.exports = router;
