import React from 'react';

import {showModal} from 'actions/modalActions';

import styles from 'scss/components/GroupCreateButton';


const GroupCreateButton = ({dispatch}) => {

    const onClick = () => dispatch(showModal({
        modalType: 'CreateGroupModal',
        modalProps: {}
    }));

    return (
        <button onClick={onClick} className={`button tangerine small expanded ${styles.button} dxtrack-user-action`} data-dx-desc={"Open create group modal"}><strong>Create A Group</strong></button>
    );
};

export default GroupCreateButton;