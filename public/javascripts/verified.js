var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var email =
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("matcha");
    dbo.collection('users').update({email:email},{$set:{verify:1}}, function(err, res) {
      if (err) throw err;
      console.log("updated successfully!");
      db.close();
    });
})