var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


// const app = require("express")();
// app.listen(3000);
// app.on("/json", (req, res) => {
//   res.sendFile("./index.js");
//   //console.log("listing on 3000");

// });

const FileSystem = require("fs");

// router.get('/file.json', function(req, res)
// {
//    //console.log("The file is being ");
// })

// router.post('/', function (req, res) {
//   //do something with req
//   if (name == '' || message == '') {
//     // sendStatus("Please insert something");
//   } else {

//     MongoClient.connect('mongodb://127.0.0.1:27017/matcha', function (err, db) {
//       if (err) {
//         throw err;
//       }

//       //console.log("MongoDB connected...");

//       var dbo = db.db("matcha");
//       let chat = dbo.collection("chats");

//       chat.insert({ name: name, message: message }, function () {


//       });

//     });
//   }
//   //console.log(req.body.mail);

// });
router.get('/', function (req, res, next) {
  
  var flag = Number(req.query.flag);
  var i = Number(req.query.i);
  var visited = new Array();
  var j = 0;

  if (req.session.user) {
    
    // res.render('chatbe', { title: 'Matcha' });
    MongoClient.connect('mongodb://127.0.0.1:27017/matcha', function (err, db) {
      if (err) {
        throw err;
      }
      
      //console.log("MongoDB connected...");
      
      //Connect to socket.io
      // io.on('connection', function (socket) {
        //   socket.emit('session_name', req.session.user.name);
        // let chat = db.collection('chats');
        var dbo = db.db("matcha");
        let chat = dbo.collection("chats");
        //function that sends status
        // sendStatus = function (s) {
          //   socket.emit('status', s)
          // };
          // chat.insertOne({name: "hello", message: "world"});
          
          //chats from the table/collection
          //----->>>
          let email = req.session.user.email;
          let name = req.session.user.name;
          let message = req.query.message;
          let to = req.query.mail;
          //console.log(req.query);
          //console.log(req.session.user);
      if (flag == -1){
        var tmp = i;
        // flag++;
        // i++;
      }
          function disp(){
            //console.log('to display');
            
            chat.find({$or:[{email: email, to: to}, {email:to, to:email}]}).limit(100).sort({ _id: 1 }).toArray(function (err, resu) {
              if (err) {
                throw err;
              }
              // socket.emit('output', res);
              resu = JSON.stringify(resu);
              // //console.log(res);
              
              FileSystem.writeFile('chats.json', ' { "chats": ' + resu + '}', function (e) {
                if (e) throw e;
              });
                db.close();
                tmp=i;
                //console.log("HERER", flag, tmp, i);
                // i++;
                res.render('chatbe', { title: 'Matcha', mail: req.query.mail, flag, i:tmp });
              });
    
          }
        function insrt(){
          //console.log('somewhere');
          
          if (email != null && message != null && req.query.mail != null && flag != (flag+1)) {
            //console.log(visited, 'ereeeewe');
            // sendStatus("Please insert something");
            chat.insert({ name: name, email: email, message: message, to: to, passed : i }, function () {
              flag++;
              i++;
              tmp = i;
              //console.log('insertwd');
              disp()
              // res.render('chatbe', { title: 'Matcha', mail: req.query.mail, flag, i });
            });
            // //console.log(req.session.user);
          }
          else
            res.render('chatbe', { title: 'Matcha', mail: req.query.mail, flag, i:tmp });
        } 

        async function vis(){
          await chat.find({email: email, to: to}).toArray(function (err, res) {
            if (err) {
              throw err;
            }
            //console.log(res);
            
            res.forEach(function(u){
              visited[j] = u.passed;
              j++;
              
            });
            
            if (j && visited.includes(i) && flag != -1){
              //console.log('it includes i');
              i++;
              flag++;
              disp();
            }
            /* if (j){
              //console.log(i, 'this is i');
              disp();
            } */
            else{
              if (flag == -1){
                flag++;
                i = Math.max.apply(Math, visited) + 1;
                tmp = i;
              }
              insrt();
            }
            
          });
        }  
        
        // //console.log(req.session.user.name);
        vis();
        /* if (name != null && message != null && req.query.mail != null && flag != (flag+1)) {
          //console.log(visited, 'ereeeewe');
          // sendStatus("Please insert something");
            flag++;
            i++;
          chat.insert({ name: name, message: message, to: to, passed : i }, function () {
            //console.log('insertwd');
          });
          // //console.log(req.session.user);
        } */
        /* chat.find({name: name, to: to}).limit(100).sort({ _id: 1 }).toArray(function (err, res) {
          if (err) {
            throw err;
          }
          // socket.emit('output', res);
          res = JSON.stringify(res);
          // //console.log(res);
          
          FileSystem.writeFile('chats.json', ' { "chats": ' + res + '}', function (e) {
            if (e) throw e;
          });
            db.close();
          }); */
          // //console.log("he");
          // res.render('chatbe', { title: 'Matcha', mail: req.query.mail, flag, i });
          
          // //console.log("hello");
          
          
        });
      }
  else
    console.log("failed");
  
});



module.exports = router;