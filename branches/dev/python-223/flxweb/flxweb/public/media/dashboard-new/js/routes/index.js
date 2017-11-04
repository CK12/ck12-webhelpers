import { mapValues, isString, isObject } from 'lodash';
import { removeOptionalPaths, addTrailingSlash, removeTrailingSlash, addOptionalTrailingSlash } from 'utils/routes';

const ROOT                    = '/my/dashboard-new';
const GROUPS_PAGE_ROOT        = `${ROOT}/groups`;
const CONTENT_PAGE_ROOT       = `${ROOT}/content`;
const CONTENT_PAGE_RECOMMENED = `${CONTENT_PAGE_ROOT}/recommended`;
const CONTENT_PAGE_STANDARDS  = `${CONTENT_PAGE_ROOT}/standards`;
const DEFAULT                 = `${CONTENT_PAGE_ROOT}/`;

const _ROUTES_MASTER = {
    default: DEFAULT,
    root: ROOT,
    home: ROOT,
    contentPage: {
        home: CONTENT_PAGE_ROOT,
        recommended: CONTENT_PAGE_RECOMMENED,
        standards: CONTENT_PAGE_STANDARDS
    },
    groupsPage: {
        home: GROUPS_PAGE_ROOT
    },
    group: {
        home: '/group/:id',
        members: '/group-members/:id',
        assignments: '/group-assignments/:id',
        resources: '/group-resources/:id',
        qa: '/group-discussions/:id',
        settings: '/group-settings/:id',
        reports: '/group-reports/:id'
    }
};

///////////////////////
// React Router URLS //
///////////////////////

// Adds optional slash to URLS in case a URL without a trailing slash is used.
// Though URLs should be redirected to a trailing slash page serverside this is not possible in all cases
// This a security blanket in those cases
const sanitizeWithOptionalSlash = (route)=>addOptionalTrailingSlash(removeTrailingSlash(route));
const sanitizeRouteWithOptionalSlash = (route)=>{
    return isString(route) ? sanitizeWithOptionalSlash(route) : route;
};

// Routes intended for just react router. NOT to be used for links!
export const REACT_ROUTER_ROUTES =  mapValues(_ROUTES_MASTER, (route)=> {
    return isObject(route) ? mapValues(route, sanitizeRouteWithOptionalSlash) : sanitizeRouteWithOptionalSlash(route);
});


////////////////
// Links URLS //
////////////////

// Add trailing slashs to ALL links
const sanitize = (route)=>addTrailingSlash(removeOptionalPaths(route));
const sanitizeRoute = (route)=>{
    return isString(route) ? sanitize(route) : route;
};

// Routes intended for links
export const ROUTES = mapValues(_ROUTES_MASTER, (route)=> {
    return isObject(route) ? mapValues(route, sanitizeRoute) : sanitizeRoute(route);
});

export default ROUTES;