import React from 'react';
import { get } from 'lodash';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

import Tooltip from 'components/common/Tooltip';
import styles from 'scss/components/GroupCard';

import { showTooltip } from 'actions/tutorialActions';
import { tutorialPaths } from 'utils/tutorial';

function getIconClassName({groupType}){
    if(groupType === 'class'){
        return 'icon-lessonplans';
    } else if(groupType === 'study') {
        return 'icon-groups';
    }
}


const GroupCardHeader = ({group, tutorial={}, dispatch}) => {
    const url = !group.id ? '#' : replacePlaceholder(routes.group.home, group.id);
    const isActiveTooltip = group.IS_DEFAULT && get(tutorial, tutorialPaths.cardTitle);
    return (
        <div className={`row align-middle ${styles.headerRow}`}>
            <div className={'column shrink'}>
                <a href={url} className="dxtrack-user-action" data-dx-desc={'Go to group page'}>
                    <img className={styles.themeImage} src={group.resource.uri} />
                </a>
            </div>
            <div className={'column small-8 medium-9'}>
                <div className={styles.headerTitles}>
                    <a href={url} title={group.name} className="dxtrack-user-action" data-dx-desc={'Go to group page'}>
                        <span className={styles.groupName}>{group.name}</span>
                    </a>
                    <br/>
                    <span className={styles.groupType}>{group.groupType}</span>
                    <i className={getIconClassName(group)}></i>
                </div>
                {isActiveTooltip ? <TitleTooltip dispatch={dispatch} /> : null}
            </div>
        </div>
    );
};

const TitleTooltip = ({dispatch}) => {
    const onClick = ()=>{
        dispatch(showTooltip(tutorialPaths.assignmentDropdown));
    };
    const arrowStyle = {
        position: 'absolute',
        left: '0.875rem'
    };

    return (
        <div className={styles.tooltip}>
            <Tooltip arrowStyle={arrowStyle}>
                <div className='row align-center'>
                    <div className='column small-11'>
                        <div>Don't worry, you can still reach the group detail page here.</div>
                        <button className={'button tangerine rounded small'} onClick={onClick}>OK</button>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};

export default GroupCardHeader;
