import React from 'react';
import styles from 'scss/components/common/MockSelectbox';

const MockSelectbox = ({onClick, count=0, type='', style={}}) => {
    const hasCount = !!count;

    return (
        <button type="button" onClick={onClick} className={styles.mockSelectBox} style={style}>
            { hasCount ? <WithCounts count={count} type={type} /> : <Default type={type} /> }
        </button>
    );
};

const Default = ({type=''}) => {
    return (
        <span>
            <span className='hide-for-small-only'>Select </span>
            <span className='show-for-small-only'><strong>0 </strong></span>
            <strong>{`${type}s`}</strong>
        </span>
    );
};

const WithCounts = ({count, type=''}) => {
    if(count > 1){ type += 's'; }
    return (
        <span>
            <strong>{count} {type}</strong> <span className='hide-for-small-only'>selected</span>
        </span>
    );
};

export default MockSelectbox;