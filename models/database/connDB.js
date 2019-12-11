const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = "mongodb://localhost:8080/matcha";

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  client.close();
});