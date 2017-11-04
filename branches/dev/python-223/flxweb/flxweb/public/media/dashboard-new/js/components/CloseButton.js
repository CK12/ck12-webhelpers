import React from 'react';
import styles from 'scss/components/CloseButton';

const CloseButton = ({onClick}) => {
    return (
        <span className={`${styles.closeButton} dxtrack-user-action`} data-dx-desc={"Close"} onClick={onClick}>
            <i className={`icon-close2`}></i>
        </span>
    );
};

export default CloseButton;