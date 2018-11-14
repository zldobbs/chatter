const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('NEW_MSG', (msg) => {
        console.log('NEW_MSG: ' + msg.txt);
        io.emit('ACTION', {txt: msg.txt});
    });
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server started on port ${port}`));