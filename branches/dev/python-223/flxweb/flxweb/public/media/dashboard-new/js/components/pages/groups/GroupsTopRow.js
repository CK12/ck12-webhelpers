import React from 'react';

import GroupsFilter from 'components/pages/groups/GroupsFilter';
import styles from 'scss/components/GroupsTopRow';

const GroupsTopRow = (props) => {
    const { groupsFilter, onFilterClick} = props;

    return (
        <div className="small-12 columns">
            <div className={`row ${styles.row} align-middle`}>
                <GroupsFilter groupsFilter={groupsFilter} onFilterClick={onFilterClick} />
            </div>
        </div>
    );
};

export default GroupsTopRow;