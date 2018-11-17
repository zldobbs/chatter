const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// array of users within app [{name, socket.id}]
let users = {};

function login(user, socket) {
    // open the json file
    let accounts = require("./accounts.json");
    let loggedIn = false; 
    console.log('Attempting to login: ' + user.username);
    for (var i = 0; i < accounts.length; i++) {
        console.log('checking username: ' + accounts[i].username);
        if (accounts[i].username == user.username) {
            if (accounts[i].password == user.password) {
                loggedIn = true; 
            }
            else {
                msg = { txt: "ERROR", err: "Incorrect password"};
                socket.emit("ACTION", msg);
            }
        }
        if (loggedIn) break;
    }
    if (!loggedIn) {
        msg = { txt: "ERROR", err: "Username does not exist"};
        socket.emit("ACTION", msg);
    }
    else {
        // login is successful
        // map the user's socketid to their username
        users[user.username] = user.socketid;
        // let everyone know updated users in chat
        io.emit('UPDATED_USERS', users);
        // let the specific client know it is logged in 
        const msg = {txt: 'LOGGED_IN', username: user.username};
        socket.emit('ACTION', msg);
    }
}

function logout(username) {
    delete users[username];
    console.log('User logged out: ' + username);
} 

// handle any connections from client 
io.on('connection', (socket) => {
    console.log('User connected ' + socket.id);

    // handle messages from client
    socket.on('NEW_MSG', (msg) => {
        console.log('NEW_MSG: ' + msg.txt);
        // send the client all connected users
        if (msg.txt.toLowerCase() == "who") {
            var act_msg = {txt: "WHO", users: users};
            socket.emit('ACTION', act_msg);
        }
        else {
            io.emit('ACTION', msg);   
        }
    });

    // handle private messages between clients
    socket.on('PRVT_MSG', (msg) => {
        console.log('PRVT_MSG: ' + msg.txt);
        let found = false;
        for (let user in users) {
            if (user == msg.receiver) {
                found = true; 
            }
            if (found) break;
        }
        if (found) {
            var newMsg = {
                txt: "PRIVATE_MESSAGE",
                bodyText: msg.txt, 
                from: msg.username,
            }
            io.to(users[msg.receiver]).emit('ACTION', newMsg);
            socket.emit("ACTION", msg);
        }
        else {
            var newMsg2 = {
                txt: "ERROR",
                err: msg.receiver + ' is not online'
            }
            socket.emit("ACTION", newMsg2);
        }
    });

    // handle login attempts from client
    socket.on('LOGIN', (user) => {
        console.log('LOGIN: ' + user.username + ', ' + user.password + ' : ' + user.socketid);
        login(user, socket);
    });

    // handle registering a new user from client
    socket.on('REGISTER', (user) => {
        console.log('REGISTER: ' + user.username + ', ' + user.password + ' : ' + user.socketid);
        // load accounts from external json file
        let accounts = require("./accounts.json");
        // check if the username trying to register already exists
        let duplicate = false;
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].username == user.username) {
                duplicate = true; 
            }
            if (duplicate) break;
        }
        if (!duplicate) {
            // add the account to the external json file
            accounts.push({username: user.username, password: user.password});
            let accountsJSON = JSON.stringify(accounts);
            fs.writeFile("./accounts.json", accountsJSON, 'utf8', (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    msg = { txt: "REGISTERED" };
                    socket.emit("ACTION", msg);
                }
            });
            login(user, socket);
        }
        else {
            msg = { txt: "ERROR", err: "Username already in use"};
            socket.emit("ACTION", msg);
        }
    });

    socket.on('LOGOUT', (user) => {
        logout(user.username);
        let msg = { txt: "LOGOUT" };
        socket.emit("ACTION", msg);
    });

    socket.on('disconnect', () => {
        let found = false; 
        // delete user from users array 
        for (let user in users) {
            let socketid = users[user];
            if (socketid == socket.id) {
                logout(user);
                found = true;
            }
            if (found) break;
        }
        if (!found) {
            console.log('User disconnected but was not signed in');
        }
    });
});

const port = 12097;
server.listen(port, () => console.log(`Server started on port ${port}`));