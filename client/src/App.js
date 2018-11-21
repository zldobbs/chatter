/*
  Zachary Dobbs 2018
  CS4450 Lab 3 - Chat room app
  
  Client root component
  Frontend built using React. 
*/

import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import DefaultNavbar from './components/DefaultNavbar';
import LoginForm from './components/LoginForm';
import LogoutBox from './components/LogoutBox';
import MessageBox from './components/MessageBox';
import MessageForm from './components/MessageForm';
import UserList from './components/UserList';
import { Container } from 'react-materialize';
import uuid from 'uuid';
import './App.css';
import 'materialize-css/dist/css/materialize.min.css';

// socket establishes connection to server from the client
const socket = socketIOClient('localhost:12097');

class App extends Component {
  constructor(props) {
    // when initializing, connect to the socket-io backend
    super(props);
    this.state = {
        username: '',
        msgs: [],
        loggedIn: false,
        users: [],
        errorMsg: '' 
    };
  }

  componentDidMount() {
    // handle any communications from the server here 
    socket.on('ACTION', (msg) => {
      console.log('SERVER SENT ACTION: ' + msg);
      switch(msg.txt) {
        case 'LOGGED_IN':
          // update status to reflect login 
          this.setState({
            username: msg.username.toLowerCase(),
            loggedIn: true,
            errorMsg: ''
          });
          break;
        case 'LOGOUT':
          // update status to reflect logout
          // find index of the user in the current array 
          let i = this.state.users.indexOf(this.state.username);
          this.setState({
            username: '',
            loggedIn: false,
            users: this.state.users.splice(i, 1),
            errorMsg: ''
          });
          break;
        case 'REGISTERED': 
          // remove any error messages
          console.log('Registered user');
          this.setState({
            errorMsg: ''
          });
          break;
        case 'WHO': 
          // show the current users
          this.setState({ users: [] });
          let users = '';
          let newUser;
          console.log('Here is who is in the room:');
          for (let user in msg.users) {
            if (users === '') {
              users = user;
            }
            else {
              users = users + ', ' + user;
            }
            // check if the user is in the array yet
            if (this.state.users.indexOf(user) < 0) {
              // add to the array 
              newUser = { id: uuid(), username: user };
              this.setState({
                users: this.state.users.concat(newUser)
              });
            }
          }
          var newMsg2 = {
            id: uuid(),
            username: 'Current users',
            txt: users,
            date: Date.now()
          }
          var msgs2 = this.state.msgs;
          this.setState({
            msgs: msgs2.concat(newMsg2),
            errorMsg: ''
          });
          break;
        case 'PRIVATE_MESSAGE':
          // display this message only to the intended receiver 
          var newMsg3 = {
            id: uuid(),
            username: 'Private message from ' + msg.from,
            txt: msg.bodyText,
            date: Date.now()
          }
          var msgs3 = this.state.msgs;
          this.setState({
            msgs: msgs3.concat(newMsg3),
            errorMsg: ''
          });
          break;
          case 'UPDATED_USERS':
            this.setState({ users: [] });
            let newUser2;
            for (let user in msg.users) {
              // check if the user is in the array yet
              if (this.state.users.indexOf(user) < 0) {
                // add to the array 
                newUser2 = { id: uuid(), username: user };
                this.setState({
                  users: this.state.users.concat(newUser2),
                  errorMsg: ''
                });
              }
            }
            break;
        case 'ERROR':
          // log the error to console as well as the user's display
          console.log('Server error: ' + msg.err);
          this.setState({
            errorMsg: msg.err
          });
          break;
        default: 
          // the default case is a general message
          // add the text from the message to the list of current messages
          var msgs = this.state.msgs;
          var newMsg = {
            id: uuid(),
            username: msg.username,
            txt: msg.txt,
            date: Date.now()
          }
          this.setState({
            msgs: msgs.concat(newMsg),
            errorMsg: ''
          });
          break;
      }
    });
  }

  render() {
    let messageForm, welcomeText, logout, errorText;
    if (this.state.loggedIn) {
      // dynamic updates if a user is logged in
      welcomeText = (<h3>Welcome, {this.state.username}</h3>);
      messageForm = <MessageForm socket={socket} username={this.state.username}></MessageForm>
      logout = <LogoutBox socket={socket} username={this.state.username}></LogoutBox>
    }
    else {
      welcomeText = (<h3>Login to chat</h3>);
      messageForm = <LoginForm socket={socket}></LoginForm>
      logout = <span></span>
    }
    if (this.state.errorMsg !== '') {
      errorText = (
        <div className="row">
          <div className="error col s12 m6 push-m3 center">
            <p>Error: {this.state.errorMsg}</p>
          </div>
        </div>
      );
    }
    else {
      errorText = <span></span>
    }
    return (
      <div className="App">
        <DefaultNavbar></DefaultNavbar>
        <Container>
          { welcomeText }
          <MessageBox msgs={this.state.msgs}></MessageBox>
          { errorText }
          { messageForm }
          { logout }
          <UserList users={this.state.users}></UserList>
        </Container>
      </div>
    );
  }
}

export default App;
