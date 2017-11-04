import React, {Component, PropTypes} from 'react';
import UserPhoto from 'components/UserPhoto';

import UserName from 'components/UserName';
import UserLocation from 'components/UserLocation';
import UserSubjects from 'components/UserSubjects';

import { showModal } from 'actions/modalActions';

import styles from 'scss/components/UserMenu';

export default class UserMenu extends Component {
    constructor(props) {
        super(props);

        this.openUserProfileModal = this.openUserProfileModal.bind(this);
    }

    openUserProfileModal(){
        const { dispatch } = this.props;

        dispatch(showModal({
            modalType: 'UpdateUserProfileModal',
            modalProps: {
                preventOverlayClick: true,
                hideCloseButton: false
            }
        }));
    }

    render() {
        const { dispatch, user, showUserNameAndLocation } = this.props;
        const { address } = user;
        const hidden = showUserNameAndLocation ? '' : 'hidden';

        return (
            <div className={`row row--fullWidth align-middle align-justify ${styles.userMenu} userMenu`}>
                <div className={`columns small-12`}>
                    <div className={`row align-middle ${styles.userMenuInnerRow}`}>

                        <div className={`column shrink ${styles.userPhotoContainer}`}>
                            <UserPhoto dispatch={dispatch} user={user} onClick={this.openUserProfileModal} />
                        </div>

                        <div className={`column ${styles.userNameLocationColumn} ${hidden}`}>
                            <UserName user={user} />
                            <UserLocation location={address} editOnHover={true} defaultText="Edit" openText="Edit" toggleLocation={this.openUserProfileModal}/>
                        </div>

                        <div className={`column hide-for-small-only`}>
                            <UserSubjects onClick={this.openUserProfileModal} />
                        </div>
                        <div className={`column shrink hide-for-small-only`}>
                            <a href="/conceptmap" className={`${styles.conceptmapButton} dxtrack-user-action`} data-dx-desc={`Go to concept map`}>Concept Map</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

UserMenu.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};