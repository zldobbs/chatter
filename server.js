const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// array of users within app [{name, socket.id}]
let users = {};

function login(user, socket) {
    // map the user's socketid to their username
    users[user.username] = user.socketid;
    // let everyone know updated users
    socket.emit('UPDATED_USERS', users);
    // let the specific client know it is logged in 
    const msg = {txt: 'LOGGED_IN', username: user.username};
    io.to(users[user.username]).emit('ACTION', msg);
}

// handle any connections from client 
io.on('connection', (socket) => {
    console.log('User connected');

    // handle messages from client
    socket.on('NEW_MSG', (msg) => {
        console.log('NEW_MSG: ' + msg.txt);
        io.emit('ACTION', msg);
    });

    // handle login attempts from client
    socket.on('LOGIN', (user) => {
        console.log('LOGIN: ' + user.username + ', ' + user.password + ' : ' + user.socketid);
        login(user, socket);
    });

    // handle registering a new user from client
    socket.on('REGISTER', (user) => {
        console.log('REGISTER: ' + user.username + ', ' + user.password + ' : ' + user.socketid);
        login(user, socket);
    });
});

const port = 12097;
server.listen(port, () => console.log(`Server started on port ${port}`));