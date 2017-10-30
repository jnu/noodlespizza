import React from 'react';
import { Link } from 'react-router';
import logo from './media/logo_bg.png';

const logoStyle = {
    width: '750px',
    top: 'calc(50% - 196px)',
    left: 'calc(50% - 450px)',
    position: 'absolute',
};

const mainStyle = {
    bottom: '10%',
    textAlign: 'center',
    position: 'absolute',
}

const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
};

export default () => (
    <div>
        <header style={{ textAlign: 'center' }}>
            <img style={logoStyle} src={logo} />
        </header>
        <div style={mainStyle}>
            <Link style={linkStyle} to="/page/formula">Formula Builder</Link>
        </div>
    </div>
);
