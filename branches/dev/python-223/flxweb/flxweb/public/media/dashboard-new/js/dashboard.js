import polyfills from './polyfills';
import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory, Redirect } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import browser from 'utils/browser';

import Dashboard from 'containers/Dashboard';

import { GroupsPage, ContentPage } from 'containers';
import {
    ContentPageSubmenu,
    MathAndScienceStandards,
    RecommendedBySubjects
} from 'components/pages/content';
import GroupsPageSubmenu from 'components/pages/groups/GroupsPageSubmenu';

import configureStore from 'store/configureStore';

import {REACT_ROUTER_ROUTES as routes} from 'routes';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

const DEFAULTS = {
    main: ContentPage,
    submenu: ContentPageSubmenu,
    pageContent: RecommendedBySubjects
};

if(browser.isIE11){ document.body.classList.add('ie11'); }

render(
    <Provider store={store}>
        <Router history={history}>
            <Route path={routes.home} component={Dashboard}>
                <IndexRoute components={DEFAULTS}/>

                <Route path={routes.contentPage.home} components={DEFAULTS} >
                    <Route path={routes.contentPage.recommended} component={RecommendedBySubjects}/>
                    <Route path={routes.contentPage.standards} component={MathAndScienceStandards}/>
                </Route>

                <Route path={routes.groupsPage.home} components={{
                    main: GroupsPage,
                    submenu: GroupsPageSubmenu
                }}/>
            </Route>

            <Redirect from='*' to={routes.home} />
        </Router>
    </Provider>,
    document.getElementById('dashboard')
);