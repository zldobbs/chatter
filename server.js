/*
    Zachary Dobbs
    CS4450 Lab 3 - Chat room app

    This is the backend of the application. 
    The server will be hosted here and handle any communications
    between clients. 
*/

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// dictionary containing user socket ids mapped to usernames 
let users = {};
let userCount = 0; 

// max number of users allowed in chat room
const MAXCLIENTS = 3;  

// handle user logins 
function login(user, socket) {
    // check if we have hit the maximum connections
    if (userCount >= MAXCLIENTS) {
        msg = { txt: "ERROR", err: "The chat room is full"};
        socket.emit("ACTION", msg);
        return;
    }
    // check if user is already logged in 
    for (let username in users) {
        if (username.toLowerCase() == user.username.toLowerCase()) {
            msg = { txt: "ERROR", err: user.username + " is already logged in"};
            socket.emit("ACTION", msg);
            return;
        }
    }
    // open the json file
    let accounts = require("./accounts.json");
    let loggedIn = false; 
    // check if the username is registered
    for (var i = 0; i < accounts.length; i++) {
        console.log('checking username: ' + accounts[i].username);
        if (accounts[i].username.toLowerCase() == user.username.toLowerCase()) {
            if (accounts[i].password == user.password) {
                loggedIn = true; 
            }
        }
        if (loggedIn) break;
    }
    if (!loggedIn) {
        msg = { txt: "ERROR", err: "Incorrect login information"};
        socket.emit("ACTION", msg);
    }
    else {
        userCount = userCount + 1;
        console.log("count: " + userCount);
        // login is successful
        // map the user's socketid to their username
        users[user.username] = user.socketid;
        // let everyone know updated users in chat
        io.emit('ACTION', {txt: 'UPDATED_USERS', users: users});
        io.emit('ACTION', {txt: 'USER_LOGIN', username: user.username});
        // let the specific client know it is logged in 
        msg = {txt: 'LOGGED_IN', username: user.username};
        socket.emit('ACTION', msg);
    }
}

// logout active user
function logout(username, socket) {
    // remove the user from the current array of users
    delete users[username];
    console.log('User logged out: ' + username);
    userCount = userCount - 1;
    console.log("count: " + userCount);
    let msg = { txt: "LOGOUT" };
    socket.emit("ACTION", msg);
    // let everyone know updated users in chat
    io.emit('ACTION', {txt: 'UPDATED_USERS', users: users});
    io.emit('ACTION', {txt: 'USER_LOGOUT', username: username});
} 

// handle any connections from client 
io.on('connection', (socket) => {
    console.log('User connected ' + socket.id);
    // send connected users 
    io.emit('ACTION', {txt: 'UPDATED_USERS', users: users});
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
        if (user.username.length >= 32) {
            msg = { txt: "ERROR", err: "Username must be less than 32 characters" }
            socket.emit("ACTION", msg);
        }
        else if (user.password.length < 4 || user.password.length > 8) {
            msg = { txt: "ERROR", err: "Password must be betweeen 4 and 8 characters" }
            socket.emit("ACTION", msg);
        }
        else {
            // load accounts from external json file
            let accounts = require("./accounts.json");
            // check if the username trying to register already exists
            let duplicate = false;
            for (var i = 0; i < accounts.length; i++) {
                if (accounts[i].username.toLowerCase() == user.username.toLowerCase()) {
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
        }
    });

    // handle user logout requests
    socket.on('LOGOUT', (user) => {
        logout(user.username, socket);
    });

    // handle when a user leaves the application 
    socket.on('disconnect', () => {
        let found = false; 
        // delete user from users array 
        for (let user in users) {
            let socketid = users[user];
            if (socketid == socket.id) {
                logout(user, socket);
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