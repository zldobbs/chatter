import React, { Component } from 'react';
import 'materialize-css/dist/css/materialize.min.css';

class UserList extends Component {
    render() {
        return(
            <div className="row">
                <div className="col s12 m4 push-m4">
                    <h4>Current Users:</h4>
                    <ul className="collection user-list-box z-depth-1">
                        {this.props.users.map((user) => (
                            <li key={user.id} className="collection-item">
                                {user.username}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default UserList;