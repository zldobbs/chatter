import React, { Component } from 'react';
import 'materialize-css/dist/css/materialize.min.css';
// comment
class DefaultNavbar extends Component {
    render() {
        return( 
            <nav>
                <div className="nav-wrapper deep-purple">
                    <a className="brand-logo def-nav" href="localhost">chatter</a>
                    <ul className="right">
                        <li><a href="http://zachdobbs.life/">More</a></li>
                    </ul>
                </div>
            </nav>
        );
    }
}

export default DefaultNavbar;