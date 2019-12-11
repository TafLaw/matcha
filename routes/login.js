var express = require('express');
var router = express.Router();
var formidable = require("formidable");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("Handled get request on the home page.");
  res.render('login', { title: 'TAF' });
});

router.post('/', (req, res, next) => {
   console.log("Handled a post request from the home page.");
});

module.exports = router;
