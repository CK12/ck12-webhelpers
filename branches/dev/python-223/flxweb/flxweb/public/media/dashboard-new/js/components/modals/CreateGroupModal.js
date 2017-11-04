import React, {PropTypes} from 'react';
import Modal from 'components/Modal';
import { CreateGroupForm } from 'components/forms';

const CreateGroupModal = (props) => {
    return (
        <Modal {...props}>
            <CreateGroupForm />
        </Modal>
    );
};

CreateGroupModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
};

export default CreateGroupModal;