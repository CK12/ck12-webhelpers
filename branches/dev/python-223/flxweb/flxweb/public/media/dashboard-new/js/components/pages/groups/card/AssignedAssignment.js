import React from 'react';
import moment from 'moment';
import { get } from 'lodash';

import routes from 'routes';
import { replacePlaceholder } from 'utils/routes';
import { tutorialPaths } from 'utils/tutorial';
import browser from 'utils/browser';
import { showTooltip } from 'actions/tutorialActions';

import Tooltip from 'components/common/Tooltip';

import styles from 'scss/components/Assignment';

const AssignedAssignment = (props) => {
    const { onArrowClick, tutorial, dispatch, group: {IS_DEFAULT} } = props;
    const isActiveTooltip = IS_DEFAULT && get(tutorial, tutorialPaths.circleGraph);
    return (
        <div className={`row align-center align-stretch small-up-1`}>
                <div className={`column`}>
                    <DueDate {...props} />
                </div>


                <div className={`column relative`}>
                    <div className={`row align-middle`}>
                        { isActiveTooltip ? <CircleGraphTooltip dispatch={dispatch} /> : null }
                        <div className={`column shrink`}><i className={`icon-arrow3_left ${styles.arrow}`} data-index='-1' onClick={onArrowClick} ></i></div>
                        <ProgressCircle {...props} />
                        <div className={`column shrink`}><i className={`icon-arrow3_right ${styles.arrow}`} data-index='+1' onClick={onArrowClick} ></i></div>
                    </div>
                    <ProgressCounts {...props} />
                </div>
        </div>
    );
};

const DueDate = (props) => {
    const { due } = props;
    var momentDue, dayAbbr, calendarDate;

    if(due){
        momentDue    = moment(new Date(due));
        dayAbbr      = momentDue.format('ddd');
        calendarDate = momentDue.format('MM/DD/YY');
    } else {
        dayAbbr      = 'No Due Date';
        calendarDate = '';
    }

    return (
        <div className={styles.date}><i className="dashboard-icon-calendar"></i> <strong>{dayAbbr}</strong> {calendarDate}</div>
    );
};

const ProgressCircle = (props) => {
    const { memberIncompleteCount, memberCompletedCount, group, id } = props;
    const totalCount = memberCompletedCount + memberIncompleteCount;

    const url = !group.id ? '#' : `${replacePlaceholder(routes.group.reports, group.id)}?assignmentID=${id}`;

    const strokeWidth   = 20;

    const diameter      = 160;
    const circumference = diameter * Math.PI - (strokeWidth * Math.PI);
    const radius        = (diameter / 2) - (strokeWidth / 2);

    let posX, posY;
    posX = posY = diameter / 2;

    const percentageCompleted = Math.round(memberCompletedCount / totalCount * 100);
    const incompleteOffset    = (memberIncompleteCount / totalCount) * circumference;

    const shadowGradient = !browser.isSafari ? 'url(#shadowGradient)' : 'transparent';
    const dropShadow     = !browser.isSafari ? 'url(#dropShadow)'     : '';

    return (
        <a href={url} className={`column dxtrack-user-action`} data-dx-desc='Progress Circle'>
            <svg className={styles.progressCircle} viewBox={`0 0 ${diameter} ${diameter}`}>
                <defs>
                    <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="dropShadow">
                        <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                        <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                        <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>
                        <feMerge>
                            <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>

                    <radialGradient id="shadowGradient" gradientUnits="objectBoundingBox" >
                       <stop offset="90%"  stopColor="black" stopOpacity="0"/>
                       <stop offset="100%" stopColor="black" stopOpacity="0.075"/>
                   </radialGradient>
                </defs>

                <g>
                    <circle className={styles.background} cx={posX} cy={posY} r={radius} strokeWidth={`${strokeWidth}px`}></circle>
                    <circle className={styles.foreground} cx={posX} cy={posY} r={radius} strokeWidth={`${strokeWidth}px`} style={{
                        strokeDasharray: `${circumference}px`,
                        strokeDashoffset: incompleteOffset
                    }}></circle>
                    <circle cx={posX} cy={posY} r={radius + strokeWidth / 2} fill={shadowGradient} ></circle>
                    <circle className={styles.inner} cx={posX} cy={posY} r={radius - strokeWidth / 2} filter={dropShadow} ></circle>
                    <text className={styles.percentage} x={posX} y={posY} textAnchor="middle" dominantBaseline="middle">{percentageCompleted}%</text>
                </g>
            </svg>
        </a>
    );
};

const ProgressCounts = (props) => {
    const { memberIncompleteCount, memberCompletedCount } = props;

    return (
        <div className={`${styles.counts} row`}>
            <span className={`${styles.completed} column`}>
                Done <strong>{memberCompletedCount}</strong>
            </span>
            <span className={`${styles.incomplete} column`}>
                Not Done <strong>{memberIncompleteCount}</strong>
            </span>
        </div>
    );
};

const CircleGraphTooltip = ({dispatch}) => {
    const onClick = ()=>{
        dispatch(showTooltip(tutorialPaths.activityCount));
    };

    return (
        <div className={styles.circleGraphTooltip}>
            <Tooltip arrowPosition='bottom'>
                <div className='row align-center'>
                    <div className='column small-11'>
                        <div>Discover which students have completed their assignments.</div>
                        <button className={'button tangerine rounded small'} onClick={onClick}>OK</button>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};

export default AssignedAssignment;