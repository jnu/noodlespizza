import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './App';
import PageWrapper from './PageWrapper';
import Home from './Home';
import DoughCalc from './DoughCalc';


export default () => {
    return (
        <Route path="/" component={ App }>
            <IndexRoute component={ Home } />
            <Route path="/page" component={ PageWrapper }>
                <Route path="formula" component={ DoughCalc } />
            </Route>
        </Route>
    );
};
