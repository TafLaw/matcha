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
    
    
          let email = req.session.user.email;
          let name = req.session.user.name;
          let message = req.query.message;
          let to = req.query.mail;

        //   function onUserSelected() {
        //     // receiver = username;
        //     // console.log(username);
        
        //     $.ajax({
        //         url: "http://localhost:3000/get_messages",
        //         method: "POST",
        //         data: {
        //             sender: mail,
        //             receiver: to
        //         },
        //         success: function (response) {
        //             console.log(response);
        
        //             let messages = JSON.parse(response);
        //             let type = "";
        //             console.log(messages[0]);
        //             for (let a = 0; a < messages.length; a++) {
        //                 console.log("compare: " + messages[a].sender + "   " + sender);
        //                 type = messages[a].sender == sender ? "you-message" : "other-message";
        //                 display(messages[a], type);
                        
        //             }
        //         }
        //     })
        // }
        // onUserSelected();
    
          function disp(){
            //console.log('to display');
            
            chat.find({$or:[{email: email, to: to}, {email:to, to:email}]}).limit(100).sort({ _id: 1 }).toArray(function (err, resu) {
              if (err) {
                throw err;
              }
              // socket.emit('output', res); cc
              resu = JSON.stringify(resu);
              // //console.log(res);c
              
              FileSystem.writeFile('chats.json', ' { "chats": ' + resu + '}', function (e) {
                if (e) throw e;
              });
                db.close();
                tmp=i;
                //console.log("HERER", flag, tmp, i);c
                // i++;c
                res.render('chat', { title: 'Matcha', mail: req.query.mail, name: req.query.name}); //, flag, i:tmp 
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
            res.render('chat', { title: 'Matcha', rMail: req.query.receiverMail, rName: req.query.receiverName.split(" ")[0], sMail: email, sName: name}); // passing only the name not the surname ( req.query.receiverName.split(" ")[0] )
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
        
        insrt();
        
      }
  else
    console.log("failed");
  
});



module.exports = router;