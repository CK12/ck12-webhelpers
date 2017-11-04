import React, {PropTypes} from 'react';
import Modal from 'components/Modal';
import { UpdateUserProfileForm } from 'components/forms';

const UpdateUserProfileModal = (props) => {
    return (
        <Modal {...props}>
            <UpdateUserProfileForm />
        </Modal>
    );
};

UpdateUserProfileModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
};

export default UpdateUserProfileModal;