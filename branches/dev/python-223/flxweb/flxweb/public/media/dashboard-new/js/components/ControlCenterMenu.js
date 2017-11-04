import React from 'react';
import { Link } from 'react-router';
import { get } from 'lodash';

import { isActive } from 'utils/routes';
import { showModal } from 'actions/modalActions';

import Tooltip from 'components/common/Tooltip';

import styles from 'scss/components/ControlCenter';
import { setActiveHeader } from 'externals';
function mergeInCounts(props){
    const { counts, menuItems } = props;
    const add = (a,b)=> a + b;

    return menuItems.map((menuItem) => {
        if (menuItem.mapsTo) {
            let _counts;

            if(menuItem.mapsTo instanceof Array){
                _counts = menuItem.mapsTo.map(item => {
                    if(item instanceof Array){
                        return item.map( k => counts[k] ).reduce(add);
                    } else {
                        return counts[item];
                    }
                });
            }

            return Object.assign({
                count: _counts || counts[menuItem.mapsTo]
            }, menuItem);
        } else {
            return menuItem;
        }
    });
}

function setActiveRoute(menuItems, location){
    let setActive = (item) => Object.assign({active: true}, item);

    return menuItems.map((item)=>{
        return isActive(item, location) ? setActive(item) : item;
    });
}

const setupMenuItems = (props) => {
    const menuItems = mergeInCounts(props);
    return setActiveRoute(menuItems, props.location);
};

function triggerGTMPageView(pageTitle){
    if(!window.dataLayer){ return; }
    window.dataLayer.push({
        pageTitle: `Teacher_Dashboard_${pageTitle}`
    });
}

//////////
// Menu //
//////////

const ControlCenterMenu = (props) => {
    const menuItems = setupMenuItems(props);
    const { tutorial, dispatch } = props;

    return (
        <ul className={`row ${styles.menu} ${styles.rowOffset} text-center align-center`}>
            {menuItems.map( menuItem =>
                <ControlCenterMenuItem key={menuItem.title} menuItem={menuItem} tutorial={tutorial} dispatch={dispatch} />
            )}
        </ul>
    );
};

//////////////
// MenuItem //
//////////////

const ControlCenterMenuItem = (props) => {
    const { menuItem, tutorial, dispatch } = props;
    let iconClass   = menuItem.iconClass;
    let activeClass = menuItem.active ? styles.active : '';

    const isGroup = menuItem.menuFor === 'Groups';

    let title          = menuItem.title,
        subtitle       = menuItem.subtitle,
        groupMenuClass = '',
        groupCount, membersCount, hasNoGroups;

    if(isGroup){
        membersCount   = Math.max(0, (menuItem.count[0] - 1));
        groupCount     = Math.max(0, menuItem.count[1]);
        groupMenuClass = styles.groupsMenuItem;
        title    = `${membersCount} ${menuItem.title}` ;
        subtitle = `${groupCount} ${menuItem.subtitle}`;
        hasNoGroups = isGroup && !groupCount;
    }

    const isTooltipActive = get(tutorial, menuItem.tutorial.mapsTo);

    return (
        <li className={`column shrink ${activeClass} ${groupMenuClass}`}>
            <Link to={menuItem.route} className={`dxtrack-user-action`} data-dx-desc={menuItem.subtitle} onClick={()=>triggerGTMPageView(menuItem.subtitle),()=>setActiveHeader(menuItem.subtitle)}>
                <div className={`row align-middle`}>
                    <div className={`column small-5 ${styles.icon}`}>
                        <i className={`dashboard-icon-${iconClass}`}></i>
                    </div>

                    { hasNoGroups ? <CreateGroupButton dispatch={dispatch} /> : <Titles title={title} subtitle={subtitle} /> }

                    <span className={styles.activeBar}></span>
                </div>
            </Link>
            {isTooltipActive ? <TutorialTooltip menuItem={menuItem} dispatch={dispatch} tutorial={tutorial} /> : null }
        </li>
    );
};

export default ControlCenterMenu;


const Titles = ({title, subtitle}) => {
    return (
        <div className={`column small-7 ${styles.titles}`}>
            <h6 className={styles.title}>{title}</h6>
            <p className={styles.subtitle}>{subtitle}</p>
        </div>
    );
};


const CreateGroupButton = ({dispatch}) => {
    const onClick = ()=>{
        dispatch(
            showModal({
                modalType: 'CreateGroupModal'
            })
        );
    };
    return (
        <button onClick={onClick} className={`button round ${styles.createGroupButton}`}>Create a Group</button>
    );
};

/////////////////////
// TutorialTooltip //
/////////////////////


const TutorialTooltip = ({menuItem, dispatch, tutorial}) => {
    const onClick = ()=>menuItem.tutorial.onClick(dispatch, tutorial);

    return (
        <div className={styles.tooltipContainer}>
            <Tooltip>
                <div>
                    <div>{menuItem.tutorial.tooltipText}</div>
                    <button className={`button tangerine rounded small`} onClick={onClick}>OK, Got it!</button>
                </div>
            </Tooltip>
        </div>
    );
};