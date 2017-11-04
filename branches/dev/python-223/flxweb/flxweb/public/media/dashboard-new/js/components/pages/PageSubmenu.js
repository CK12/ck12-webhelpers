import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';

import { isArray, size } from 'lodash';

import { isActive } from 'utils/routes';

import PageSubmenuButton from './PageSubmenuButton';
import styles from 'scss/components/PageSubmenu';

function setActiveRoute(menuItems, location){
    let setActive = (item) => Object.assign({active: true}, item);

    return menuItems.map(menuItem =>
        isActive(menuItem, location) ? setActive(menuItem) : menuItem
    );
}

export default class PageSubmenu extends Component {
    constructor(props) {
        super(props);
    }

    hasActions(){
        const { pageActions } = this.props;
        return isArray(pageActions) && size(pageActions) > 0;
    }

    render() {
        const {menuItems:_menuItems, location, pageActions, dispatch} = this.props;
        const menuItems = setActiveRoute(_menuItems, location);

        return (
            <div className={`small-12 columns ${styles.menu} pageSubmenu`}>
                <div className={`row align-middle align-stretch ${styles.menuRow}`}>
                    <ul className={`column small-12`}>
                        {menuItems.map(menuItem => {
                            return <MenuItem key={menuItem.title} {...menuItem} />;
                        })}
                    </ul>
                    { this.hasActions() ? <PageSubmenuButton buttonActions={pageActions} dispatch={dispatch} /> : null }
                </div>
            </div>
        );
    }
}

const MenuItem = ({title, active, route}) => {
    const activeClass = active ? styles.active : '';
    return (
        <li className={`column shrink ${activeClass}`}>
            <Link to={route} className={`dxtrack-user-action`} data-dx-desc={title}>
                {title}
            </Link>
        </li>
    );
};

PageSubmenu.propTypes = {
    menuItems: PropTypes.array,
    pageActions: PropTypes.array,
    dispatch: PropTypes.func.isRequired
};