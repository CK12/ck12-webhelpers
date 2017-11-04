import React, {Component} from 'react';
import { Promise } from 'bluebird';
import moment from 'moment';
import { merge, map, get, first, flatten, uniq } from 'lodash';

import QueueableComponent from 'components/base/QueueableComponent';
import Tooltip from 'components/common/Tooltip';

import routes from 'routes';
import { hideTutorial, showTooltip } from 'actions/tutorialActions';
import { hideModal } from 'actions/modalActions';

import { tutorialPaths } from 'utils/tutorial';
import { replacePlaceholder } from 'utils/routes';
import {
    activityTypes,
    isAssignment, isChangeDueDate, isCreate,
    isPeerhelp, isShare, isJoin,isLeave,
    ASSIGNMENT_DELETE
} from 'utils/groupActivity';
import { stripHTML } from 'utils/formatting';

import styles from 'scss/components/GroupCard';


function getMember(props){
    const { user } = props;
    let _member = {};

    if( isAssignment(props) || isChangeDueDate(props) || isCreate(props) ){
        const { owner } = props;
        _member.id   = owner.id;
        _member.name = owner.name;

    } else if ( isPeerhelp(props) || isShare(props) ){
        const { activityData: {member} } = props;
        _member.name = member.firstName;
        _member.id  = member.memberID ? member.memberID : member.id;

    } else if(isJoin(props)){
        const { member } = props;
        _member.name = member.name;
        _member.id   = member.id;
    }

    if(_member.id == user.id){ _member.name = 'You'; }

    return _member;
}

function getTitle(props){
    let _title = '',
        _url;

    if ( isPeerhelp(props) ){
        const { activityData: {post: {content}} } = props;
        _title = content;

    } else if(isLeave(props)){
       	const {member: {name}} = props;
            _title = name;
    } else if ( isJoin(props) ){
        const {member: {name}} = props;
        _title = name;

    } else if ( isAssignment(props) ){
        const { activityType, activityData: {name}, group: {id} } = props;
        _title = name;

        if(activityType !== ASSIGNMENT_DELETE){
            _url = replacePlaceholder(routes.group.assignments, id);
        }
    } else if( isShare(props) ){
        const { activityData: {title, url}} = props;
        _title = title;
        _url   = url;

    } else if ( isChangeDueDate(props) ){
        const { activityData: {name}} = props;
        _title = name;
    } else if ( isCreate(props) ) {
        const { group: {name, id} } = props;
        _title = name;
        _url   = !id ? '#' /* for demo card */ : replacePlaceholder(routes.group.home, id);
    }

    if(_url && _title){
        return <a href={_url} className={styles.activityTitle}>{stripHTML(_title)}</a>;
    } else {
        return <span className={styles.activityTitle}>{stripHTML(_title)}</span>;
    }
}

function getSubtitle(props, member){
    const { creationTime, activityType } = props;
    const action = activityTypes[activityType].action;
    let time;

    if( isChangeDueDate(props) ){
        const { activityData: {due}} = props;
        time = due === 'none' ? due : moment(new Date(due), 'YYYYMMDD').format('L');
    } else {
        time = moment(new Date(creationTime), 'YYYYMMDD').fromNow();
    }

    return <span className={styles.activitySubtitle}>{member.name} {action} {time}</span>;
}

const initialState = {
    assignments:{
        activeIndex: 0,
        viewed: []
    },
    members:{
        activeIndex: 0,
        viewed: []
    },
    shared:{
        activeIndex: 0,
        viewed: []
    },
    'q&a':{
        activeIndex: 0,
        viewed: []
    }
};


export default class Activities extends QueueableComponent {
    constructor(props) {
        super(props);

        this.state = Object.assign({}, initialState);

        this.onBulletClick = this.onBulletClick.bind(this);
        this.onArrowClick  = this.onArrowClick.bind(this);
        this.getViewed     = this.getViewed.bind(this);
        this.clearViewed   = this.clearViewed.bind(this);
        this.markViewed    = this.markViewed.bind(this);
    }

    componentDidMount(){
        super.componentDidMount();
    }

    componentWillUnmount(){
        super.componentWillUnmount();
    }

    onBulletClick(activityType, index=0){
        return new Promise((resolve)=>{
            this.setState(merge({}, this.state, {
                [activityType]: {
                    activeIndex: index
                }
            }), resolve);
        });
    }

    onArrowClick(activityType, index=0){
        return new Promise((resolve)=>{
            this.setState(merge({}, this.state, {
                [activityType]: {
                    activeIndex: index
                }
            }), resolve);
        });
    }

    getViewed(){
        return flatten(map(this.state,
            (item)=>get(item, 'viewed', [])
        ));
    }

    markViewed(activityType, row){
        const currentViewed = this.state[activityType].viewed;

        return this.queue.addPromise((resolve)=>{
            this.setState(merge({}, this.state, {
                [activityType]: {
                    viewed: uniq(flatten([
                        map(row, (activity)=>get(activity, 'id')),
                        currentViewed
                    ]))
                }
            }), resolve);
        });
    }

    clearViewed(activityType){
        return this.queue.addPromise((resolve)=>{
            this.setState(Object.assign({}, this.state, {
                [activityType]: {
                    activeIndex: 0,
                    viewed: []
                }
            }), resolve);
        });
    }

    render() {
        const { activities, user, group, activeMenu, onClick, markGroupActivityViewed, tutorial, dispatch } = this.props;

        const activityKeys    = Object.keys(activities);
        const activeActivitiy = first( activityKeys.filter( key => activeMenu === key) );

        let activityTypeClass = '',
            studyGroupClass   = '',
            Content;

        if(activeActivitiy) {
            const rows      = activities[activeActivitiy];
            const activeRow = this.state[activeActivitiy].activeIndex || 0;

            activityTypeClass = styles[activeActivitiy];

            if(group.groupType === 'study'){
                studyGroupClass = styles.isStudyGroup;
            }

            Content = <ActivityRow
                key={activeActivitiy}
                rows={rows}
                activeRow={activeRow}
                row={rows[activeRow]}
                user={user}
                group={group}
                onClick={onClick}
                onBulletClick={this.onBulletClick}
                onArrowClick={this.onArrowClick}
                getViewed={this.getViewed}
                markViewed={this.markViewed}
                clearViewed={this.clearViewed}
                activityType={activeActivitiy}
                markGroupActivityViewed={markGroupActivityViewed}
            />;
        }

        if(!Content){ return null; }

        const isTooltipActive = group.IS_DEFAULT && get(tutorial, tutorialPaths.activityFeed);

        return (
            <div className={`row align-center ${activityTypeClass} ${studyGroupClass} ${styles.activityRowContainer}`}>
                { isTooltipActive ? <ActivityFeedTooltip dispatch={dispatch} tutorial={tutorial} /> : null }
                <div className={`column small-11`}>
                    { Content }
                </div>
            </div>
        );
    }
}

class ActivityRow extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        const { markViewed, activityType, row, group: {IS_DEFAULT} } = this.props;
        if(IS_DEFAULT){ return; }
        markViewed(activityType, row);
    }

    componentWillUnmount(){
        const { activityType, clearViewed, getViewed, group, markGroupActivityViewed } = this.props;
        if(group.IS_DEFAULT){ return; }
        markGroupActivityViewed(group.id, getViewed())
            .then(()=> clearViewed(activityType) );
    }

    render() {
        const {rows, row, activeRow, activityType, user, onClick, onBulletClick, onArrowClick, markViewed, group} = this.props;

        return (
            <div className={`row ${styles.activityRow} align-justify align-middle`}>
                <span className={`${styles.activityRowClose} dxtrack-user-action`} data-dx-desc={"Close group activity row"} onClick={onClick}>
                    <i className={`icon-close2`}></i>
                </span>
                <ActivityBullets rows={rows} activeRow={activeRow} activityType={activityType} onBulletClick={onBulletClick} markViewed={markViewed} />

                <ActivityArrow rows={rows} activeRow={activeRow} activityType={activityType} onArrowClick={onArrowClick} markViewed={markViewed} movement={-1} />

                {row.map( (activity, i, row) => {
                    return <Activity key={activity.id} {...activity} user={user} row={row} rows={rows} group={group} />;
                })}

                <ActivityArrow rows={rows} activeRow={activeRow} activityType={activityType} onArrowClick={onArrowClick} markViewed={markViewed} movement={+1} />
            </div>
        );
    }
}

const ActivityArrow = ({movement, rows, activeRow, activityType, onArrowClick, markViewed}) => {
    if( !rows.length || rows.length === 1 ){ return null; }

    const onClick = () => {
        let nextRowIndex = activeRow + movement;

        // At the beginning going to the end
        if(nextRowIndex === -1){
            nextRowIndex = rows.length - 1;

        // At the end going to the beginning
        } else if (nextRowIndex === rows.length) {
            nextRowIndex = 0;
        }

        onArrowClick(activityType, nextRowIndex).then(()=>{
            markViewed(activityType, rows[nextRowIndex]);
        });
    };

    const arrowPosition = movement === -1 ? 'icon-arrow3_left' : 'icon-arrow3_right';

    return (
        <div className={`${styles.arrow} column small-1 ${arrowPosition} dxtrack-user-action`} data-dx-desc={"Click group activity arrow"} onClick={onClick}></div>
    );
};

const ActivityBullets = ({rows, activeRow, activityType, onBulletClick, markViewed}) => {
    if( !rows.length || rows.length === 1 ){ return null; }

    const onClick = (row, i) => {
        onBulletClick(activityType, i).then(()=>{
            markViewed(activityType, row);
        });
    };

    return (
        <ul className={`${styles.bullets} hide-for-small`}>
            {rows.map((row, i)=>{
                let activeClass = activeRow === i ? styles.activeBullet : '';
                return <li key={i} className={`${activeClass} dxtrack-user-action`} data-dx-desc={"Click group activity bullet"} onClick={()=>onClick(row, i)}></li>;
            })}
        </ul>
    );
};

const Activity = (props) => {
    const member   = getMember(props);
    const hasSingleActivity = props.row.length === 1;
    const hasArrows         = props.rows.length > 1;

    let colWidth;
    if(hasSingleActivity){
        colWidth = hasArrows ? 10 : 12;
    } else {
        colWidth = hasArrows ? 5 : 6; // Increase colwidth when no arrows
    }

    let titleColWidth = hasSingleActivity ? 'small-9' : 'small-6 large-8';

    return (
        <div className={`column small-${colWidth}`}>
            <div className="row align-middle">
                <div className={`column shrink`}>
                    <img className={styles.userImage} src={`/auth/member/image/${member.id}`} alt={member.name} />
                </div>
                <div className={`column ${titleColWidth}`}>
                    <span className={styles.activityDetails}>
                        {getTitle(props)}
                        {getSubtitle(props, member)}
                    </span>
                </div>
            </div>
        </div>
    );
};


const ActivityFeedTooltip = ({dispatch, tutorial}) => {
    const onClick = ()=>{
        dispatch(hideModal());
        if(tutorial.isFirstTimeUser){
            dispatch(showTooltip(tutorialPaths.mastheadTutorial));
        	$(window).scrollTop(0);
        } else {
            dispatch(hideTutorial());
        }
    };

    return (
        <div className={styles.tooltipActivityFeed}>
            <Tooltip arrowPosition='bottom'>
                <div className='row align-center'>
                    <div className='column small-11'>
                        <div>View all your updates in a glance.</div>
                        <button className={'button tangerine rounded small'} onClick={onClick}>OK</button>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};