import React from 'react';


const mainStyle = {
    padding: '6rem',
    width: '100%',
    height: '100%',
};

export default ({ children }) => (
    <div style={mainStyle}>
        <div>
            {children}
        </div>
    </div>
);
