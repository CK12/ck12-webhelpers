import React from 'react';
import { userName } from 'scss/components/UserName';

const UserName = (props) => {
    return (
        <div className={userName}>
            {props.user.firstName} {props.user.lastName}
        </div>
    );
};

export default UserName;