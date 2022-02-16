const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000
const io = require('socket.io')(server);
const path = require('path');

app.use(express.static(path.join(__dirname + '/public')));

// emit a message showing user they've connectd w a match

io.on('connection', socket => {
    console.log('Client connected')
    socket.on('chat', message => {
        console.log('From client: ', message)
        io.emit('chat', message)
    })

    socket.on('disconnect', socket => {
        console.log('Client disconnected')
    })
})

server.listen(port, () => {
    console.log('Server is running on port: 3000');
});