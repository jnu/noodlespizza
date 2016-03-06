import { Route } from 'dreija/router';
import React from 'react';


const App = () => (
    <div>
        <p>Joe Pizza!</p>
        <p>Todo: Write app.</p>
    </div>
);

export default dreija => {
    dreija.routes(
        <Route path="/" component={ App } />
    );
};
