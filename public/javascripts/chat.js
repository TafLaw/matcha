const socket = io();
const msgText = document.querySelector('#msg');
const btnSend = document.querySelector('#btn-send');
const chatBox = document.querySelector('.chat-content');
const displayMsg = document.querySelector('.message');

// let name = document.querySelector('#sender').textContent.trim();
let receiver = document.querySelector('#receiver-name').textContent.trim();
let sender = document.querySelector('#sender-name').textContent.trim();
let receiverMail = document.querySelector('#receiver-mail').textContent.trim();
let senderMail = document.querySelector('#sender-mail').textContent.trim();

// do {
//     name = prompt('What is you name?')
// } while (!name);

console.log(receiver);

socket.emit('user_connected', senderMail);
// document.querySelector('#your-name').textContent = name;
// sender = name;
msgText.focus();

socket.on('user_connected', username => {
    // console.log(username);
    onUserSelected();
    // var html = "";

    // html += "<li><button onclick='onUserSelected(this.innerHTML);'>" + username + "</button></li>";
    // document.getElementById('users').innerHTML += html;
})

function onUserSelected() {
    // receiver = username;
    // console.log(username);
    let data = {
        sender: senderMail,
        receiver: receiverMail
    };

    $.ajax({
        url: "/get_messages",
        method: "POST",
        data: data,
        success: function (response) {
            console.log(response);

            let messages = JSON.parse(response);
            let type = "";
            console.log(messages[0]);
            for (let a = 0; a < messages.length; a++) {
                console.log("compare: " + messages[a].senderMail + "   " + senderMail);
                type = messages[a].senderMail == senderMail ? "you-message" : "other-message";
                display(messages[a], type);
                
            }
        },
        error : function(e) {
            console.info(e.statusText);
        },
    })
}

btnSend.addEventListener('click', (e) => {
    e.preventDefault()
    sendMsg(msgText.value);
    msgText.value = ''
    msgText.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
});

const sendMsg = message => {
    let msg = {
        senderName: sender,
        senderMail: senderMail,
        receiverMail: receiverMail,
        message: message.trim()
    }

    display(msg, 'you-message');

    socket.emit('sendMessage', msg);
}

socket.on('newMessage', msg => {
    display(msg, 'other-message')
})

// socket.on('sendToAll', msg => {
//     display(msg, 'other-message')
// });

const display = (msg, type) => {
    const msgDiv = document.createElement('div');
    let className = type;
    msgDiv.classList.add(className, 'message-row');
    let times = new Date().toLocaleTimeString();


    let innerText = `
                        <div class="message-title">
                                <span>${msg.senderName}</span>

                            </div>
                            <div class="message-text">
                            ${decodeURI(msg.message)}
                            </div>
                            <div class="message-time">
                            ${times}
                            </div>
    `;
    msgDiv.innerHTML = innerText;
    displayMsg.appendChild(msgDiv);
}