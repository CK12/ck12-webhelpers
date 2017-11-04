import React, {PropTypes} from 'react';
import PageSubmenu from 'components/pages/PageSubmenu';
import routes from 'routes';

const MENU_ITEMS = [
    {
        title: 'Recommended by Subjects',
        route: routes.contentPage.recommended,
        alias: [routes.home, routes.contentPage.home]
    },
    {
        title: 'Standards Aligned Flexbooks',
        route: routes.contentPage.standards
    }
];


const ContentPageSubmenu = ({dispatch, location}) => {
    return (
        <PageSubmenu dispatch={dispatch} location={location} menuItems={MENU_ITEMS} />
    );
};

ContentPageSubmenu.propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired
};


export default ContentPageSubmenu;