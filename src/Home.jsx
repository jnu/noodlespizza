import React from 'react';
import { Link } from 'react-router';
import logo from './media/logo_bg.png';

const logoStyle = {
    height: '50%',
    top: '25%',
    left: '0%',
    position: 'absolute',
};

const mainStyle = {
    bottom: '10%',
    textAlign: 'center',
    width: '100%',
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
