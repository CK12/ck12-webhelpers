import React, {PropTypes } from 'react';
import { connect } from 'react-redux';

import * as modals from 'components/modals';

const MODAL_COMPONENTS = {...modals};

const ModalRoot = (props) => {
    const { dispatch, user, appData, modal: {modalType, modalProps}, location } = props;

    if (!modalType || !MODAL_COMPONENTS.hasOwnProperty(modalType) ) { return null; }

    const SpecificModal = MODAL_COMPONENTS[modalType];
    return <SpecificModal dispatch={dispatch} user={user} appData={appData} location={location} {...modalProps} />;
};


ModalRoot.propTypes = {
    dispatch: PropTypes.func.isRequired,
    modal: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    appData: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        modal: state.modal,
        user: state.user,
        appData: state.appData
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalRoot);