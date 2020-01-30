
// (function () {
    var element = function (id) {
        return document.getElementById(id);
    }
    
    var btn = element('btn');
    
    
    // $.getJSON('file.json', function (data) {
    //     console.log(data);
    // });
    // var socket = io();
    // setTimeout("location.reload();",8000)
    
    var m_input = element('m_input');
    // var m = element('m');
    var messageRec = element('messageRec');
    
    
    
    
    btn.addEventListener('click', loadText());
    btn.addEventListener('click', submitText);
    
    
    function loadText() {
    
        // e.preventDefault();
        
    
        console.log('hello');
        console.log("btn clicked");
    
        var xhr = new XMLHttpRequest();
        // xhr.overrideMimeType("application/json");
        xhr.open('GET', 'http://localhost:3000/chats', true);
    
        // $.ajax({
        //     type: "GET",
        //     url: "/chatbe",
        //     data: { message: m_input },
        //     success: function(data) {
        //         console.log(data);
    
        //     },
        //     error: function(jqXHR, textStatus, err) {
        //         alert('text status '+textStatus+', err '+err)
        //     }
        // });
    
        // console.log(xhr);
    
        xhr.onload = function () {
            if (this.status == 200) {
                var messages = JSON.parse(this.responseText);
                console.log(messages);
    
                output = "";

    
                for (var i in messages) {
                    output +=
                        '<div class = "user">' +
                        '<ul>' +
                        '<li>' + messages[i].name + ': ' + messages[i].message + '</li>' +
                        '</ul>' +
                        '</div>';
                }
                m.innerHTML = output;
                // b.innerHTML = output;
            }
        }
        xhr.send();
    }
    
    function submitText(e) {
    
        // e.preventDefault();
    
        // xhr.overrideMimeType("application/json");
        
        
        // $('form').submit(function (e) {
        //     e.preventDefault(); // prevents page reloading
        //     console.log(m_input.value);
        //     $('#m_input').val('');
        //     return false;
        //     var xhr = new XMLHttpRequest();
                            
        // });
        var xhr = new XMLHttpRequest();
        
        xhr.open('GET', 'http://localhost:8080/chatbe?message=' + m_input.value +"&"+ "mail=" + messageRec.value, true);
        
        // console.log(xhr);
    
       
        xhr.send();
    }
    // });
    
    
    
    
    
    
    // function checkFirstVisit() {
    //     // if (document.cookie.indexOf('mycookie') == -1) {
    //     //     // cookie doesn't exist, create it now
    //     //     document.cookie = 'mycookie=1';
    //     //     return 0;
    //     // }
    //     // else {
    //     //     // not first visit, so alert
    //     //     // alert('You refreshed!');
    //     //     console.log('You refreshed!');
    //     //     console.log(document.cookie.indexOf('mycookie'));
    //     //     // document.cookie.indexOf('mycookie') = -1;
    //     //     // alert(document.cookie);
    //     //     return 1;
    //     // }
    //     // alert('are you sure?')
    //     // return confirm("Changes you made may not be saved.");
    //     console.log();
    
    //     return "heyyyy....";
    
    // }
    
    // (function x() {
    //     var socket = io();
    //     // $('form').submit(function(e){
    //     //   e.preventDefault(); // prevents page reloading
    //     //   socket.emit('chat_message', $('#m').val());
    //     //   $('#m').val('');
    //     //   return false;
    //     // });
    
    
    //     var element = function (id) {
    //         return document.getElementById(id);
    //     }
    
    //     //get elements
    //     var status = element('status');
    //     var m = element('m');
    //     var m_input = element('m_input');
    
    
    
    //     // const name = prompt("What is your name?");
    //     // socket.emit("new_user", name);
    
    //     // var setStatus = function(s){
    //     //     status.textContent = s
    //     // };
    
    //     socket.on('connect', function () {
    //         console.log('Connected to server');
    
    //         socket.on('session_name', function (messSender) {
    //             // console.log(messSender);
    
    
    //             if (socket !== undefined) {
    //                 console.log("Connected to socket...");
    
    //                 socket.on('output', function (data) {
    //                     console.log(data);
    //                     if (data.length) {
    //                         for (var x = 0; x < data.length; x++) {
    //                             //print_out message
    //                             var message = document.createElement('div');
    //                             message.setAttribute('class',
    //                                 "chat-message"
    //                             );
    //                             message.textContent = data[x].name + ": " + data[x].message; //data[x].name+ ": "+ removed it from the right
    //                             m.appendChild(message);
    
    //                             // m.insertBefore(message, m.firstChild);
    //                         }
    //                         // $('#m').val('');
    //                     }
    
    
    //                     if (checkFirstVisit() == true) {
    //                         socket.off('output');//just added
    //                     } else {
    //                         console.log("not reloaded");
    
    //                     }
    //                     //   console.log(checkFirstVisit());
    
    
    
    //                 });
    //             }
    
    //             document.onkeydown = function (e) {
    //                 if (e.keyCode == 116 || (e.keyCode == 82 && e.ctrlKey)) {
    //                     e.preventDefault();
    //                 }
    //             }
    //             $('form').submit(function (e) {
    //                 e.preventDefault(); // prevents page reloading
    //                 socket.emit('input', {
    //                     name: messSender,// the person's name
    //                     message: m_input.value,
    //                 });
    //                 $('#m_input').val('');
    //                 return false;
    //             });
    
    //             // socket.off('output');
    //             // socket.off('session_name');//just add
    //         });//end of session name
    
    
    //         // socket.emit('createMess', {
    //         //     from: "thok",
    //         //     text: "hello world everyone"
    //         // })
    //     });
    //     socket.on('disconnect', function () {
    //         console.log('Disconnected to server');
    //     });
    
    
    
    //     // socket.on("newMessage", function(msg){
    //     //     console.log("Message: ", msg);
    //     // });
    // })();