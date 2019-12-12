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
    db.close();
  });
});