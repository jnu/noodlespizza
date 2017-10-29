import React from 'react';


const mainStyle = {
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
