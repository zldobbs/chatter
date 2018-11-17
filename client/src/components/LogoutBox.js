import React, { Component } from 'react';
import 'materialize-css/dist/css/materialize.min.css';

class LogoutBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: props.socket,
            username: props.username
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        let msg = { username: this.state.username };
        this.state.socket.emit("LOGOUT", msg);
    }

    render() {
        return(
            <div className="row">
                <div className="col s12 col m6 push-m3 logoutBtn">
                    <button onClick={this.handleClick} className="btn waves-effect red">Logout</button>
                </div>
            </div>
        );
    }
}  

export default LogoutBox;