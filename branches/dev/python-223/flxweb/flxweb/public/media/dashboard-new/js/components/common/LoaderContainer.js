import React from 'react';

import Loader from '../Loader';
import styles from 'scss/components/LoaderContainer';

const LoaderContainer = (props) => {
	const {label,display} = props;
	let hide = display ? "" : "hide";
    return (
    		<div className={`row ${styles.loaderContainer} ${hide}`}>
    			<div className={`column small-12 align-self-middle`}>
    				<div>{label || `loading..`}</div>
    				<Loader />
    			</div>
    		</div>
    )
};

export default LoaderContainer;