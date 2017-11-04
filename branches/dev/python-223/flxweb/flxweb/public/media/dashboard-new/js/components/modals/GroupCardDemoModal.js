import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import { first } from 'lodash';

import Modal from 'components/Modal';
import { CreateGroupForm } from 'components/forms';
import { GroupCard } from 'components/pages/groups/card';

import { hideModal } from 'actions/modalActions';

import groupsDefault from 'sources/groupsDefault';
import styles from 'scss/components/GroupCardDemoModal';

const GroupCardDemoModal = (props) => {
    const { dispatch } = props;
    const { groups } = groupsDefault;
    const group = first(groups);

    return (
        <Modal reset={true} className={styles.modal} {...props}>
            <div className={`row`}>
                <Alert dispatch={dispatch} />
                <GroupCard group={group} {...props} />
            </div>
        </Modal>
    );
};

const Alert = ({dispatch}) => {
    const closeModal = ()=>{
    	dispatch(hideModal());
    	$(window).scrollTop(0);
    }

    return (
        <div className={`columns small-12 ${styles.alert}`}>
            <div className={`row align-middle align-center`}>
                <CloseButton onClick={closeModal} />
                <div className={`column shrink`}>
                    <i className={`icon-Info ${styles.icon}`}></i>
                </div>
                <div className={`column small-9`}>
                    <h5><strong>Example: Demo Class</strong></h5>
                    <p>
                        This is an example called "My First Class" designed to help you get familiar with our new interface.
                    </p>
                </div>
            </div>
        </div>
    );
};

const CloseButton = ({onClick}) => {
    return (
        <i onClick={onClick} className={`icon-close2 ${styles.closeButton} dxtrack-user-action`} data-dx-desc={"Close button modal"}></i>
    );
};

GroupCardDemoModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    groupsActivitites: PropTypes.object.isRequired,
    groupsAssignments: PropTypes.object.isRequired,
    tutorial: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        user: state.user,
        groupsActivitites: state.groupsActivitites,
        groupsAssignments: state.groupsAssignments,
        tutorial: state.tutorial
    };
};

const mapDispatchToProps = (dispatch) => {
    return { dispatch };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupCardDemoModal);
