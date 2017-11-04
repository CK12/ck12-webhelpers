import React from 'react';

import GroupCardHeader from './GroupCardHeader';

import styles from 'scss/components/GroupCardContentOverlay';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

const CardOverlayNoAssignments = ({group, onClose}) => {
    const url = replacePlaceholder(routes.group.assignments, group.id);

    const { role } = group;
    const isAdmin = role === 'groupadmin';

    if(!isAdmin){ return null; }

    return (
        <div className={`row ${styles.cardOverlay} align-middle align-center show-for-large`}>

            <div className={`column small-12 ${styles.header}`}>
                <GroupCardHeader group={group} />
            </div>

            <div className={`column small-11 ${styles.content}`}>
                <div className={`row align-center align-middle`}>
                    <div className={`column small-10 medium-8 ${styles.sectionLeft}`}>
                        <div className={`row align-center align-middle`}>
                            <div className={`column small-12 medium-2 text-center`}>
                                <i className={`dashboard-icon-assignments`}></i>
                            </div>
                            <div className={`column small-12 medium-10`}>
                                <h6>No assignments yet?</h6>
                                <p>
                                    Get started by creating an assignment for your group in just a few simple steps.
                                </p>
                            </div>
                        </div>


                    </div>


                    <div className={`column small-10 medium-4 ${styles.sectionRight} text-center`}>
                        <a href={`${url}?pageType=create`} className="button chunky expanded dxtrack-user-action" data-dx-desc={"Create an assignment"}>Create Assignment</a>
                        <span onClick={onClose}>No thanks, I'll do it later.</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CardOverlayNoAssignments;