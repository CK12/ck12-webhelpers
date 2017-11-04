import React from 'react';
import styles from 'scss/components/GroupsCards';

import { filter, matches, isMatch, includes, chunk } from 'lodash';

import { GroupCard } from 'components/pages/groups/card';

const CARDS_PER_ROW = 1;

const GroupsCards = (props) => {
    const { user , groups:{groups} } = props;

    const groupRows = chunk(groups, CARDS_PER_ROW);
    return (
        <div className="small-12 columns">
            {groupRows.map((groups, index) =>
                <GroupRow key={index} groups={groups} user={user}/>
            )}
        </div>
    );
};

const GroupRow = (props) => {
    const { groups, user} = props;

    return (
        <div className={`row align-left ${styles.row}`}>
            {groups.map((group) =>
                <GroupCard key={group.handle} group={group} colWidth={12 / CARDS_PER_ROW} user={user} />
            )}
        </div>
    );
};

export default GroupsCards;
