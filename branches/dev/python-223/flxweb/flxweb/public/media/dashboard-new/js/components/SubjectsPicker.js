import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { keys, isEqual, isFunction } from 'lodash';

import Checkbox from 'components/common/forms/Checkbox';
import ClickOutside  from 'react-onclickoutside';

import { setUserSubjects } from 'actions/userSubjectsActions';

import styles from 'scss/components/SubjectsPicker';

class SubjectsPicker extends Component {
    constructor(props){
        super(props);
        this.state = {
            expandedBranch: null
        };
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.toggleBranchExpansion = this.toggleBranchExpansion.bind(this);
    }
    handleClickOutside(){
        this.props.onClose();
    }
    toggleBranchExpansion(branchName=''){
        if(branchName === this.state.expandedBranch){ branchName = ''; } // If same name then close toggle
        this.setState(Object.assign({}, this.state, {
            expandedBranch: branchName
        }));
    }
    componentWillUnmount(){
        const { field, setUserSubjects, onCloseCallback } = this.props;

        if(isFunction(onCloseCallback)){
            onCloseCallback();
        } else if(!isEqual(field.initialValue, field.value)){
            const subjects = field.value.join(',').toLowerCase();
            setUserSubjects({subjects});
        }
    }

    render() {
        const {subjects, field} = this.props;

        return (
            <div className={styles.subjectsPicker}>
                <div className={`${styles.row} text-left row small-up-1 collapse`}>
                    {keys(subjects).map(key =>{
                        return <SubjectBranch key={key} toggleBranchExpansion={this.toggleBranchExpansion} expandedBranch={this.state.expandedBranch} field={field} {...subjects[key]} />;
                    })}
                </div>
            </div>
        );
    }
}

const SubjectBranch = (props) => {
    const {branchName, branches, field, toggleBranchExpansion, expandedBranch} = props;
    const expanded = (expandedBranch === branchName) ? styles.expanded : '';
    const onBranchClick = ()=>toggleBranchExpansion(branchName);
    var branch_name = (branchName === 'Mathematics') ? 'Math' : branchName;
    return (
        <div className={`column ${styles.subjectBranch} ${expanded}`}>
            <div onClick={onBranchClick} className={styles.branchName}>
                <i className="icon-arrow-up"></i>
                {branch_name}
            </div>
            <div className={`row small-up-1 ${styles.branches}`}>
                {branches.map( branch => {
                    return <SubjectBranchCheckbox key={branch.id} field={field} {...branch} />;
                })}
            </div>
        </div>
    );
};

const SubjectBranchCheckbox = ({name, handle, field}) => {
    return (
        <div className="column">
            <Checkbox id={handle} value={name} field={field} />
            <label htmlFor={handle}>{name.replace(/Elementary Math/g,'')}</label>
        </div>
    );
};


SubjectsPicker.propTypes = {
    subjects: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        subjects: state.subjects
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUserSubjects: (subjects) => {
            setUserSubjects(subjects, dispatch);
        }
    };
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ClickOutside(SubjectsPicker));