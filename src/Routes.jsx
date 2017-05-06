import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App';
import Home from './Home';
import DoughCalc from './DoughCalc';


export default () => {
    return (
        <Route path="/" component={ App }>
            <IndexRoute component={ Home } />
            <Route path="/formula" component={ DoughCalc } />
        </Route>
    );
};
