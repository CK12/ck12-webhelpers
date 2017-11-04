import React from 'react';

import styles from 'scss/components/Loader';

const Loader = (props) => {
    return (
        <i className={`icon-loop ${styles.loader}`}></i>
    );
};

export default Loader;