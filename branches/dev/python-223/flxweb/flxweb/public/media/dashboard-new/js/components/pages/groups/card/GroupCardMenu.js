import React from 'react';
import { get } from 'lodash';

import Tooltip from 'components/common/Tooltip';
import styles from 'scss/components/GroupCard';

import { showTooltip } from 'actions/tutorialActions';
import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';
import { tutorialPaths } from 'utils/tutorial';

const MEMBERS_TITLE = 'members';
const QA_TITLE      = 'q&a';

const menuItems = [
    {
        title: MEMBERS_TITLE,
        iconClass: 'students',
        mapsTo: 'membersCount',
        url: routes.group.members
    },
    {
        title: 'assignments',
        iconClass: 'assignments',
        mapsTo: 'totalAssignmentsCount',
        url: routes.group.assignments,
        groupType: 'class'
    },
    {
        title: 'shared',
        iconClass: 'share',
        mapsTo: 'resourcesCount',
        url: routes.group.resources
    },
    {
        title: QA_TITLE,
        iconClass: 'qa',
        mapsTo: 'total', // maps from peerhelp
        url: routes.group.qa
    }
];


const GroupCardMenu = ({group, counts, onClick, isActivityOpen, dispatch, tutorial, peerhelp }) => {
    counts = counts || {};
    const activityMenuOpenClass = isActivityOpen ? styles.activityMenuOpen : '';

    return (
        <div className={`row align-middle align-center`}>
            <div className="column small-12">
                <ul className={`row text-center align-middle align-center ${styles.menuRow} ${activityMenuOpenClass}`}>
                    {menuItems.map(item => {
                        return <GroupCardMenuItem
                            key={item.title}
                            group={group}
                            item={item}
                            newCount={counts[item.title]}
                            onClick={onClick}
                            dispatch={dispatch}
                            tutorial={tutorial}
                            peerhelp={peerhelp}
                        />;
                    })}
                </ul>
            </div>
        </div>
    );
};

const GroupCardMenuItem = ({group, peerhelp, item, newCount, onClick, tutorial, dispatch}) => {
    if(item.groupType && group.groupType !== item.groupType){ return null; }
    const { title, mapsTo, iconClass, url} = item;
    const isMember = title === MEMBERS_TITLE;
    const isQA     = title === QA_TITLE;
    let count;

    if(isQA) {
        count = get(peerhelp.QACounts, `${group.id}.${mapsTo}`, 0);
    } else {
        count = get(group, mapsTo, 0);
        if(isMember){ count = Math.max(0, (count - 1)); } // Remove current user from count
    }

    const _newCount = newCount || 0;

    const _url = !group.id ? '#' : replacePlaceholder(url, match => group[ match.slice(1) ]);
    const _onClick = ()=>onClick(title);

    const isTooltipActive = group.IS_DEFAULT && get(tutorial, tutorialPaths.activityCount);

    return (
        <li className={`column align-center ${styles.menuItem}`}>
            { _newCount ? <NewCount count={_newCount} onClick={_onClick} /> : null }
            { _newCount && isTooltipActive ? <ActivityCountTooltip dispatch={dispatch} onClick={_onClick} /> : null }
            <a href={_url} className={`dxtrack-user-action`} data-dx-desc={`Go to Group ${title}`}>
                <i className={`dashboard-icon-${iconClass}`}></i>
                <span className={styles.menuItemTitle}>{title}</span>
                <span className={styles.menuItemCount}>{count}</span>
            </a>
        </li>
    );
};


const NewCount = ({count, onClick}) => {
    return (
        <span className={`${styles.newCount} dxtrack-user-action`} data-dx-desc={"Open group activity"} onClick={onClick} >
            <span>+{count}</span>
        </span>
    );
};

const ActivityCountTooltip = ({dispatch, onClick}) => {
    const onTooltipClick = ()=>{
        dispatch(showTooltip(tutorialPaths.activityFeed));
        onClick();
    };
    return (
        <div className={styles.tooltipActivityCount}>
            <Tooltip arrowPosition='left'>
                <div className='row align-middle'>
                    <div className='column'>
                        New activity counts will show here.
                    </div>
                    <div className='column shrink'>
                        <button className='button tangerine round' onClick={onTooltipClick}>OK</button>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};

export default GroupCardMenu;