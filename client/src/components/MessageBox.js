import React, { Component } from 'react';
import 'materialize-css/dist/css/materialize.min.css';

class MessageBox extends Component {
    render() {
        return(
            <div className="row">
                <ul className="collection msg-box z-depth-2">
                    {this.props.msgs.map((msg) => (
                        <li key={msg.id} className="collection-item">
                            {/* <span className="left">{msg.txt}</span>
                            <span className="right text-muted">{msg.date}</span> */}
                            {msg.txt}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default MessageBox;