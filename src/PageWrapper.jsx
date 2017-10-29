import React from 'react';
import { Link } from 'react-router';
import logo from './media/logo_bg.png';


export default ({ children }) => (
    <div>
        <header style={{ textAlign: 'center' }}>
            <Link to="/">
                <img src={logo} width='300' height='150' style={{ position: 'relative', left: -75 }} />
            </Link>
        </header>
        <div>
            {children}
        </div>
    </div>
);
