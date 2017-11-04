import React from 'react';

import styles from 'scss/components/GroupCard';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';

const CardNoMembers = ({group}) => {
	const {groupType} = group ;
	let url = ''
	if(groupType === 'study'){
	     url = `${replacePlaceholder(routes.group.members, group.id)}`;
	}else{
	     url = `${replacePlaceholder(routes.group.members, group.id)}#add_members`;
	}


    return (
        <div className={`row align-center align-middle text-center`}>
            <div className={`column small-10`}>
                <h6>No members yet.</h6>
                <p>
                    Invite people to your group by emailing the Group Code.
                </p>
                <div className={styles.mockInput}>{group.accessCode}</div>
                <a href={url} className="button expanded dxtrack-user-action show-for-large" data-dx-desc={"Invite to group"}>Invite to group</a>
            </div>
        </div>
    );
};

export default CardNoMembers;
