import React from 'react';
import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

import styles from 'scss/components/Assignment';

const UnassignedAssignment = (props) => {
    const { group, onArrowClick } = props;

    const url = replacePlaceholder(routes.group.assignments, group.id);

    return (
        <div className={`row align-middle`}>
            <div className={`column small-2`}>
                <i className={`icon-arrow3_left ${styles.arrow} dxtrack-user-action`} data-dx-desc={"Show previous assignment"} data-index='-1' onClick={onArrowClick} ></i>
            </div>
            <a href={url} className={`button column dxtrack-user-action`} data-dx-desc={"Go to assign page"}>
                Not assigned
            </a>
            <div className={`column small-2`}>
                <i className={`icon-arrow3_right ${styles.arrow} dxtrack-user-action`} data-dx-desc={"Show next assignment"} data-index='+1' onClick={onArrowClick} ></i>
            </div>
        </div>
    );
};

export default UnassignedAssignment;