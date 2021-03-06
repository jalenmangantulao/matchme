// var express = require('express');
// var app = express();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// var moment = require('moment');
// var port = process.env.PORT || 3000
// var now = moment();
// var path = require('path');

// app.use(express.static(path.join(__dirname + '/public')));

// // emit a message showing user they've connectd w a match

// io.on('connection', socket => {
//     console.log('Client connected')
//     socket.on('chat', message => {
//         console.log('From client: ', message)
//         io.emit('chat', message)
//     })

//     socket.on('disconnect', socket => {
//         console.log('Client disconnected')
//     })
// })

// server.listen(port, () => {
//     console.log('Server is running on port: 3000');
// });

var PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var now = moment();

app.use(express.static(__dirname + '/public'));

var clientInfo = {};
var queue = [];
io.on('connection', function (socket) {
    console.log("User connected");   
    // Disconnect Event Handler
    socket.on('disconnect', function() {
        // If socket is still in queue remove that too
        var index = queue.indexOf(socket);
        if (index > -1) {
            queue.splice(index, 1);
        }

        var userData = clientInfo[socket.id];
        if (userData) {
        var partnerId = clientInfo[socket.id].partner;
        var partnerData = clientInfo[partnerId];
        }
        
        if (typeof userData !== 'undefined' && typeof partnerData !== 'undefined') {
            io.to(userData.room).emit('message', {
               name: "System",
               text: userData.name + ' has left! Please restart to find a new matchup.',
               timestamp: moment().valueOf()
            });
            socket.leave(clientInfo[socket.id]);
            socket.leave(clientInfo[partnerId]);
            delete clientInfo[socket.id];
            delete clientInfo[partnerId];
        }
    });
    
    // Join Room Event Handler
    socket.on('joinRoom', function(req) {
    socket.emit('message', {
        name: 'System',
        text: 'Welcome to chat-matchmaking, we are matching you now!',
        timestamp: moment().valueOf()
    });
        
        clientInfo[socket.id] = req;
        if (queue.length > 0) {
            var matchedSocket = queue.pop();
            var roomName = socket.id + '#' + matchedSocket.id;
            var name = clientInfo[socket.id].name;
            var matchedName = clientInfo[matchedSocket.id].name;
            
            
            socket.join(roomName);
            matchedSocket.join(roomName);
            
            // Update ClientInfo
            clientInfo[socket.id].room = roomName;
            clientInfo[socket.id].partner = matchedSocket.id;
            clientInfo[matchedSocket.id].room = roomName;
            clientInfo[matchedSocket.id].partner = socket.id;
            
            matchedSocket.in(roomName).emit('message', {
               name: 'System',
               text: 'You have been matched! Say hi to ' + matchedName + ' !',
               timestamp: moment().valueOf()
            });
            
            socket.in(roomName).emit('message', {
               name: 'System',
               text: 'You have been matched! Say hi to ' + name + ' !',
               timestamp: moment().valueOf()
            });
        } else {
            clientInfo[socket.id].room = null;
            clientInfo[socket.id].partner = null;
            queue.push(socket);
        }
        console.log(clientInfo);
    });
    
    chat.addEventListener('submit', event => {
        event.preventDefault()
        socket.emit('chat', Input.value)
        Input.value = ''
    });

    // Message Event Handler
    socket.on('message', function (message) {
        console.log("Message being broadcast: " + message.text);
        
        if (message.text === '@currentUsers') {
            sendCurrentUsers(socket);   
        } else {
            io.to(clientInfo[socket.id].room).emit("message", message); 
        }
    });
});

// Helpers
function sendCurrentUsers(socket) {
    var info = clientInfo[socket.id];
    var users = [];
    
    if (typeof info === 'undefined') {
        return;
    }
    
    Object.keys(clientInfo).forEach(function (socketId) {
        var userInfo = clientInfo[socketId];
        if (info.room == userInfo.room) {
            users.push(userInfo.name);   
        }
    });
    
    socket.emit('message', {
        name: 'System',
        text: 'Current users: ' + users.join(','),
        timestamp: moment().valueOf()
    });
}

http.listen(PORT, function() {
    console.log("Server starting on " + PORT);
});
