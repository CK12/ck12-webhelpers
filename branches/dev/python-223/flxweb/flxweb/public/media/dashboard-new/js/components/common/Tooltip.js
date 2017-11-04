import React, {PropTypes} from 'react';
import styles from 'scss/components/common/Tooltip';

const Tooltip = ({ children, arrowPosition='top', style={}, arrowStyle={} }) => {
    return (
        <div className={styles.tooltip} style={style}>
            <div className={`${styles.arrow} ${styles[arrowPosition]}`} style={arrowStyle}></div>
            <div className={styles.tooltipContent}>
                {children}
            </div>
        </div>
    );
};

Tooltip.propTypes = {
    children: PropTypes.element.isRequired,
    arrowPosition: PropTypes.string,
    style: PropTypes.object,
    arrowStyle: PropTypes.object
};

export default Tooltip;