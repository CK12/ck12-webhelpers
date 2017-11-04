import React from 'react';

import GroupCardHeader from './GroupCardHeader';

import styles from 'scss/components/GroupCardContentOverlay';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

const CardOverlayNoMembers = ({group, onClose}) => {
	const {groupType} = group ;
	let url = ''
	if(groupType === 'study'){
	     url = `${replacePlaceholder(routes.group.members, group.id)}`;
	}else{
	     url = `${replacePlaceholder(routes.group.members, group.id)}#add_members`;
	}
    const memberTypeText = group.groupType === 'study' ? 'members' : 'students';

    return (
        <div className={`row ${styles.cardOverlay} align-center align-middle show-for-large`}>

            <div className={`column small-12 ${styles.header}`}>
                <GroupCardHeader group={group} />
            </div>

            <div className={`column small-11 ${styles.content}`}>
                <div className={`row align-center align-middle`}>
                    <div className={`column small-10 medium-8 ${styles.sectionLeft}`}>
                        <div className={`row align-center align-middle`}>
                            <div className={`column small-12 medium-2 text-center`}>
                                <i className={`dashboard-icon-students`}></i>
                            </div>
                            <div className={`column small-12 medium-10`}>
                                <h6>Want to add {memberTypeText} to your group?</h6>
                                <p>
                                    Get started by adding {memberTypeText} to your group in just a few simple steps.
                                </p>
                            </div>
                        </div>


                    </div>


                    <div className={`column small-10 medium-4 ${styles.sectionRight} text-center`}>
                        <a href={url} className="button chunky expanded dxtrack-user-action" data-dx-desc={"Invite to group"}>Add {memberTypeText}</a>
                        <span onClick={onClose}>No thanks, I'll do it later.</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CardOverlayNoMembers;
