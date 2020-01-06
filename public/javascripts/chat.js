
$(function () {
    var socket = io();
    // $('form').submit(function(e){
    //   e.preventDefault(); // prevents page reloading
    //   socket.emit('chat_message', $('#m').val());
    //   $('#m').val('');
    //   return false;
    // });

    var element = function(id){
        return document.getElementById(id);
    }

    //get elements
    var status = element('status');
    var m = element('m');
    var m_input = element('m_input');

    // const name = prompt("What is your name?");
    // socket.emit("new_user", name);

    var setStatus = function(s){
        status.textContent = s
    };
    socket.on('connect', function(){
        console.log('Connected to server');


        socket.on('output', function(data){
            // console.log(data);
            if(data.length)
            {
                for (var x = 0; x < data.length; x++){
                    //print_out message
                    var message = document.createElement('div');
                    message.setAttribute('class',
                        "chat-message"
                    );
                    message.textContent = data[x].name+ ": "+data[x].message;
                    m.appendChild(message);
                    m.insertBefore(message, m.firstChild);
                }
            }
        });
    
    
        $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('input', {
          name: "You",
          message: m_input.value,
      });
      $('#m_input').val('');
      return false;
    });

        // socket.emit('createMess', {
        //     from: "thok",
        //     text: "hello world everyone"
        // })
    });
    socket.on('disconnect', function(){
        console.log('Disconnected to server');
    });

    socket.on("newMessage", function(msg){
        console.log("Message: ", msg);
    });
  });