import React, { Component } from 'react';
import 'materialize-css/dist/css/materialize.min.css';

// Handle login attempts from the client here 

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: props.socket,
            username_val: '',
            password_val: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    sendAction(msg) {
        if (this.state.username_val.length > 0 && this.state.password_val.length > 0) {
            const newUser = {
                username: this.state.username_val.toLowerCase(),
                password: this.state.password_val,
                socketid: this.state.socket.id
            }
            this.state.socket.emit(msg, newUser);
            this.setState({
                username_val: '',
                password_val: '',
            });
        }
    }

    handleLogin() {
        this.sendAction("LOGIN");
    }

    handleRegister() {
        this.sendAction("REGISTER")
    }

    render() {
        return(
            <div className="row">
                <div className="col s12 m8 push-m2">
                    <div className="row">
                        <div className="col s12 m6 input-field">
                            <input id="username" name="username_val" value={this.state.username_val} type="text" onChange={this.handleChange} className="validate" />
                            <label htmlFor="username" className="active">Username</label>
                        </div>
                        <div className="col s12 m6 input-field">
                            <input id="password" name="password_val" value={this.state.password_val} type="password" onChange={this.handleChange} className="validate"/>
                            <label htmlFor="Password" className="active">Password</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s12 m2 push-m2 loginBtn">
                            <button onClick={this.handleLogin} className="btn waves-effect deep-purple">
                                Login
                            </button>
                        </div>
                        <div className="col s12 m2 push-m2 loginBtn">
                            <button onClick={this.handleRegister} className="btn waves-effect deep-purple">
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginForm;