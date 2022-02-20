const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000
const io = require('socket.io')(server);
const path = require('path');

// console timestamp 
// const timestamp = require('console-stamp')(console, '[HH:MM:ss.l]');

app.use(express.static(path.join(__dirname + '/public')));

// console log timestamp
// express.logger.format('mydate', function() {
//     var df = require('console-stamp/node_modules/dateformat');
//     return df(new Date(), 'HH:MM:ss.l');
// });
// app.use(express.logger('[:mydate] :method :url :status :res[content-length] - :remote-addr - :response-time ms'));


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