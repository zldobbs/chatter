import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import DefaultNavbar from './components/DefaultNavbar';
import LoginForm from './components/LoginForm';
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
        loggedIn: false
    };
  }

  componentDidMount() {
    socket.on('ACTION', (msg) => {
      console.log('SERVER SENT ACTION: ' + msg);
      switch(msg.txt) {
        case 'LOGGED_IN':
          this.setState({
            username: msg.username,
            loggedIn: true
          });
          break;
        default: 
          let msgs = this.state.msgs;
          let newMsg = {
            id: uuid(),
            username: msg.username,
            txt: msg.txt,
            date: Date.now()
          }
          this.setState({
            msgs: msgs.concat(newMsg)
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
    let messageForm, welcomeText;
    if (this.state.loggedIn) {
      welcomeText = (<h3>Welcome, {this.state.username}</h3>);
      messageForm = <MessageForm socket={socket} username={this.state.username}></MessageForm>
    }
    else {
      welcomeText = (<h3>Login to chat</h3>);
      messageForm = <LoginForm socket={socket}></LoginForm>
    }
    return (
      <div className="App">
        <DefaultNavbar></DefaultNavbar>
        <Container>
          { welcomeText }
          <MessageBox msgs={this.state.msgs}></MessageBox>
          { messageForm }
        </Container>
      </div>
    );
  }
}

export default App;
