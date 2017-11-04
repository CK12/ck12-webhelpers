import React from 'react';

import styles from 'scss/components/GroupCard';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

const CardNoAssignments = ({group}) => {
    const url = replacePlaceholder(routes.group.assignments, group.id);
    const { role } = group;

    const isAdmin = role === 'groupadmin';

    return (
        <div className={`row align-center align-middle text-center`}>
            <div className={`column small-10`}>
                <i className={`dashboard-icon-assignments ${styles.noAssignments}`}></i>
                <h6>No assignments yet.</h6>
                <p>
                    {isAdmin ? 'Get started by creating an assignment for your group.' : 'Contact the group leader to create an assignment.'}
                </p>
                {isAdmin ? <a href={`${url}?pageType=create`} className="button expanded dxtrack-user-action show-for-large" data-dx-desc={"Create an assignment"}>Create Assignment</a> : null }
            </div>
        </div>
    );
};

export default CardNoAssignments;
