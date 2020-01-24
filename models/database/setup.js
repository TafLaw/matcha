var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/matcha";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

var ur = "mongodb://localhost:27017/";

MongoClient.connect(ur, function(err, db) {
  if (err) throw err;
  var dbo = db.db("matcha");
  dbo.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
  });

  dbo.createCollection("connections", function(err, res) {
    if (err) throw err;
    console.log("Connections Collection created!");
  });

  dbo.createCollection("notifications", function(err, res) {
    if (err) throw err;
    console.log("notifications Collection created!");
  });

  dbo.createCollection("profiletext", function(err, res) {
    if (err) throw err;
    console.log("profiletext created!");
  });

  dbo.createCollection("rating", function(err, res) {
    if (err) throw err;
    console.log("rating created!");
  });

  dbo.createCollection("profileimages", function(err, res) {
    if (err) throw err;
    console.log("profileimages created!");
  });
  dbo.createCollection("profiletags", function(err, res) {
    if (err) throw err;
    console.log("profiletags created!");
  });
  dbo.createCollection("profileGeo", function(err, res) {
    if (err) throw err;
    console.log("profileGeo created!");
  });

  dbo.createCollection("profileGallery", function(err, res) {
    if (err) throw err;
    console.log("profileGallery created!");
  });
  dbo.createCollection("profile", function(err,res)
  {
    if(err) throw err;
    console.log("profile colection created!");
    db.close();
  });
});