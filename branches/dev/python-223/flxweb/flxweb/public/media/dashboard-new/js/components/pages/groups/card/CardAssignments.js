import React, {Component } from 'react';
import { find, findIndex, get } from 'lodash';

import { tutorialPaths } from 'utils/tutorial';

import AssignedAssignment from './AssignedAssignment';
import UnassignedAssignment from './UnassignedAssignment';
import SeeAllAssignments from './SeeAllAssignments';
import Tooltip from 'components/common/Tooltip';

import { showTooltip } from 'actions/tutorialActions';
import styles from 'scss/components/Assignment';

export default class CardAssignments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedAssignment: this.props.assignments[0]
        };

        this.onChange = this.onChange.bind(this);
        this.onArrowClick = this.onArrowClick.bind(this);
    }

    onChange(evt){
        let selected = find(this.props.assignments, {
            id: Number(evt.target.value)
        });

        if(!selected){
            selected = {
                isSeeAll: true
            };
        }

        this.setState(Object.assign({}, this.state, {
            selectedAssignment: selected
        }));
    }

    onArrowClick(evt){
        let assignmentsCount = this.props.assignments.length;

        let nextIndex    = +evt.target.getAttribute('data-index'),
            currentIndex = findIndex(this.props.assignments, this.state.selectedAssignment),
            newIndex     = currentIndex + nextIndex;

        // At the beginning going to the end
        if(newIndex === -1){
            newIndex = assignmentsCount - 1;

        // At the end going to the beginning
        } else if (newIndex === assignmentsCount) {
            newIndex = 0;
        }

        this.setState(Object.assign({}, this.state, {
            selectedAssignment: this.props.assignments[newIndex]
        }));
    }

    render() {
        const { selectedAssignment } = this.state;

        return (
            <div className={`row align-middle align-center text-center`}>
                <div className={`column ${styles.assignment}`}>
                    <AssignmentsCount {...this.props} />
                    <AssignmentsSelector onChange={this.onChange} selectedAssignment={selectedAssignment} {...this.props} />
                    <AssignmentContent onArrowClick={this.onArrowClick} {...selectedAssignment} {...this.props} />
                </div>
            </div>
        );
    }
}

const AssignmentsCount = ({assignments}) => {
    const text = assignments.length === 1 ? 'Recent Assignment' : 'Recent Assignments';

    return (
        <div className="row">
            <span className={`column ${styles.totalAssignmentsCount}`}>
                <strong>{assignments.length}</strong> {text}
            </span>
        </div>
    );
};

const AssignmentsSelector = ({onChange, assignments, selectedAssignment, dispatch, tutorial, group: {IS_DEFAULT} }) => {
    const isActiveTooltip = IS_DEFAULT && get(tutorial, tutorialPaths.assignmentDropdown);
    return (
        <div className="row align-center">
            <div className="column small-10 medium-8">
                { isActiveTooltip ? <AssignmentDropdownTooltip dispatch={dispatch} /> : null }
                <select className={styles.selector} onChange={onChange} value={selectedAssignment.id}>
                    {assignments.map(assignment => {
                        return <option key={assignment.id} value={assignment.id}>{assignment.name}</option>;
                    })}
                    { assignments.length >= 10 ? <option value={0}>See all assignments</option> : null}
                </select>
            </div>
        </div>
    );
};

const AssignmentContent = (props) => {
    const { assigned, isSeeAll } = props;

    if(isSeeAll){
        return <SeeAllAssignments {...props} />;
    } else if(assigned){
        return <AssignedAssignment {...props} />;
    } else {
        return <UnassignedAssignment {...props} />;
    }
};

const AssignmentDropdownTooltip = ({dispatch}) => {
    const onClick = ()=>{
        dispatch(showTooltip(tutorialPaths.circleGraph));
    };

    return (
        <div className={styles.assignmentDropdownTooltip}>
            <Tooltip arrowPosition='bottom'>
                <div className='row align-center'>
                    <div className='column small-11'>
                        <div>Use the dropdown or arrows to select assignments to view.</div>
                        <button className={'button tangerine rounded small'} onClick={onClick}>OK</button>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};