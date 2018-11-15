import React, { Component } from 'react';
import 'materialize-css/dist/css/materialize.min.css';

class MessageForm extends Component {
    constructor(props) {
        // when initializing, connect to the socket-io backend
        super(props);
        this.state = {
            username: props.username,
            value: '',
            socket: props.socket
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({
            value: e.target.value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const msg = {
            txt: this.state.value,
            username: this.state.username
        }
        this.state.socket.emit('NEW_MSG', msg);
        this.setState({
            value: ''
        });
    }

    render() {
        return(
            <div className="row">
                <div className="col s12 m8 push-m2">
                    <form onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="input-field col s9">
                                <input type="text" id="msg" value={this.state.value} onChange={this.handleChange} className="validate" />
                                <label htmlFor="msg" className="active">Message</label>
                            </div>
                            <div className="input-field col s3">
                                <input className="btn waves-effect deep-purple" type="submit" value="Submit" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

}


export default MessageForm;