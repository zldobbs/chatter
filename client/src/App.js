import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import DefaultNavbar from './components/DefaultNavbar';
import MessageBox from './components/MessageBox';
import MessageForm from './components/MessageForm';
import { Container } from 'react-materialize';
import uuid from 'uuid';
import './App.css';
import 'materialize-css/dist/css/materialize.min.css';

const socket = socketIOClient('localhost:5000');

class App extends Component {
  constructor(props) {
    // when initializing, connect to the socket-io backend
    super(props);
    this.state = {
        msgs: []
    };
  }

  componentDidMount() {
    socket.on('ACTION', (msg) => {
      console.log('SERVER SENT ACTION: ' + msg.txt);
      switch(msg.txt) {
        default: 
          let msgs = this.state.msgs;
          let newMsg = {
            id: uuid(),
            txt: msg.txt,
            date: Date.now()
          }
          this.setState({
            msgs: msgs.concat(newMsg)
          });
          console.log('msgs: ' + this.state.msgs);
          break;
      }
    });
  }

  render() {
    return (
      <div className="App">
        <DefaultNavbar></DefaultNavbar>
        <Container>
          <MessageBox msgs={this.state.msgs}></MessageBox>
          <MessageForm socket={socket}></MessageForm>
        </Container>
      </div>
    );
  }
}

export default App;
