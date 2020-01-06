var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


router.get('/', function(req, res, next) {

  if (req.session.user){

    MongoClient.connect('mongodb://127.0.0.1:27017/matcha', function(err, db){
          if(err) {
            throw err;
          }
          
          console.log("MongoDB connected...");
          io.on('connection', function(socket){
            // let chat = db.collection('chats');
            var dbo = db.db("matcha");
            let chat = dbo.collection("chats");
            //function that sends status
            sendStatus = function(s){
              socket.emit('status', s)
            };
            // chat.insertOne({name: "hello", message: "world"});
      
            //chats from the table/collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
          if(err){
            throw err;
          }
          socket.emit('output', res);
      
          //object for socker user
          var users = {};
      
          socket.on("new_user", function(name){
            users[socket.id] = name;
            console.log(users);
            console.log(name);
          });
      
          socket.on('input', function(data){
            let name = data.name;
            let message = data.message;
      
            if (name == '' || message == '')
            {
              sendStatus("Please insert something");
            } else {
              chat.insert({name: name, message: message}, function(){
                socket.emit('output', [data]);
      
                sendStatus({
                  message: "message sent",
                  clear: true
                });
              });
            }
          });
        });
      
      
          });
      
        });//this where i ended.... putting code inside mongodb connection
  
      console.log("hello");
      
      res.render('chatbe', { title: 'Express' });
  }
  else
    console.log("failed");
    
  });

  

  module.exports = router;