import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import DefaultNavbar from './components/DefaultNavbar';
import LoginForm from './components/LoginForm';
import LogoutBox from './components/LogoutBox';
import MessageBox from './components/MessageBox';
import MessageForm from './components/MessageForm';
import { Container } from 'react-materialize';
import uuid from 'uuid';
import './App.css';
import 'materialize-css/dist/css/materialize.min.css';

/*
  Client root component
*/

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
        errorMsg: '' 
    };
  }

  componentDidMount() {
    socket.on('ACTION', (msg) => {
      console.log('SERVER SENT ACTION: ' + msg);
      switch(msg.txt) {
        case 'LOGGED_IN':
          this.setState({
            username: msg.username.toLowerCase(),
            loggedIn: true,
            errorMsg: ''
          });
          break;
        case 'LOGOUT':
          this.setState({
            username: '',
            loggedIn: false,
            errorMsg: ''
          });
          break;
        case 'REGISTERED': 
          console.log('Registered user');
          this.setState({
            errorMsg: ''
          });
          break;
        case 'WHO': 
          let users = '';
          console.log('Here is who is in the room:');
          for (let user in msg.users) {
            if (users === '') {
              users = user;
            }
            else {
              users = users + ', ' + user;
            }
            console.log(users);
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
        case 'ERROR':
          console.log('Server error: ' + msg.err);
          this.setState({
            errorMsg: msg.err
          });
          break;
        default: 
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

  MessageFormToggle(props) {
    if (props.loggedIn) {
      return (
        <MessageForm socket={socket}></MessageForm>
      );
    }
    else {
      return (<span></span>);
    }
  }

  render() {
    let messageForm, welcomeText, logout, errorText;
    if (this.state.loggedIn) {
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
        <div className="error">
          <p>{this.state.errorMsg}</p>
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
        </Container>
      </div>
    );
  }
}

export default App;
