import React, {PropTypes} from 'react';
import PageSubmenu from 'components/pages/PageSubmenu';
import routes from 'routes';
import { showModal } from 'actions/modalActions';

const ACTIONS = [
    {
        title: 'Create a Group',
        action() {
            return showModal({
                modalType: 'CreateGroupModal',
                modalProps: {}
            });
        }
    },
    {
        title: 'Join a Group',
        action() {
            return showModal({
                modalType: 'JoinGroupModal',
                modalProps: {}
            });
        }
    }
];

const MENU_ITEMS = [
    {
        title: 'Recent Group Activity',
        route: routes.groupsPage.home
    }
];


const GroupsPageSubmenu = (props) => {
    const {dispatch, location} = props;

    return (
        <PageSubmenu dispatch={dispatch} location={location} menuItems={MENU_ITEMS} pageActions={ACTIONS} />
    );
};

GroupsPageSubmenu.propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired
};


export default GroupsPageSubmenu;