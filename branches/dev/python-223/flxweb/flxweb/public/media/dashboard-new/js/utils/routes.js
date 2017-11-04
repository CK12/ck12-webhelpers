import { includes } from 'lodash';
import routes from 'routes';

function hasTrailingSlash(str){
    return /\/$/.test(str);
}

function hasOptionalTrailingSlash(str){
    return /\(\/{1}\?{1}\)/g.test(str);
}

export function removeTrailingSlash(str){
    return str.replace(/\/$/, '');
}

export function addTrailingSlash(str){
    return !hasTrailingSlash(str) ? `${str}/` : str;
}

export function addOptionalTrailingSlash(str){
    return !hasOptionalTrailingSlash(str) ? `${str}(/?)` : str;
}

export function removeOptionalPaths(route){
    return route.replace(/\(\/?(:|\?)?[\w]*\)/g, '');
}

export function removeQueryParams(route){
    return route.replace(/(\?|\&)[\w\X]+=[\w\X]+/g, '');
}

export function replacePlaceholder(url, cb=()=>{} ){
    return url.replace(/:\w+[^\/]?/, cb);
}

export function isActive(menuItem, location){
    const currentPath = removeTrailingSlash(removeQueryParams(location.pathname));
    const menuRoute   = removeTrailingSlash(removeOptionalPaths(menuItem.route));

    return menuRoute === currentPath ||

        // Since the default path is an alias for home
        currentPath === removeTrailingSlash(routes.home) && menuRoute === removeTrailingSlash(routes.default) ||

        // Has an alias - check all alias with the current path
        ( menuItem.alias ? includes(menuItem.alias.map(removeTrailingSlash), currentPath) : false );
}

export function getActive(menuItems, location){
    return menuItems.filter((menuItem)=>isActive(menuItem, location))[0];
}