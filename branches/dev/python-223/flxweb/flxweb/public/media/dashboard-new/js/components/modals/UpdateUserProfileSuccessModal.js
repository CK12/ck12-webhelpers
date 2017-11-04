import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import { browserHistory } from 'react-router';
import modalStyles from 'scss/components/Modal';
import styles from 'scss/components/UpdateUserProfileSuccessModal';

import {
    showModal,
    hideModal
} from 'actions/modalActions';

import { saveAppData } from 'actions/appDataActions';

import { showTutorial } from 'utils/tutorial';

import routes from 'routes';

class UpdateUserProfileSuccessModal extends Component {
    constructor(props) {
        super(props);

        this.closeModal =  this.closeModal.bind(this);
        this.showCreateGroupModal = this.showCreateGroupModal.bind(this);
    }

    markDashboardAsSeen() {
        const { dispatch, appData } = this.props;
        saveAppData(dispatch, appData, {
            userdata: {
                seenNewTeacherDashboard: true
            }
        });
    }

    showCreateGroupModal(){
        const { dispatch, appData } = this.props;
        dispatch(showModal({
            modalType: 'CreateGroupModal'
        }));
        this.markDashboardAsSeen();
    }

    closeModal(){
        const { dispatch } = this.props;
        dispatch(hideModal());

        this.markDashboardAsSeen();
        browserHistory.push(routes.contentPage.home);
        showTutorial(this.props);
    }

    render() {
        const { user } = this.props;

        return (
            <Modal className={modalStyles.blueGradient} {...this.props}>
                <div className={`row align-middle align-center text-center ${styles.modal}`}>
                    <div className={`column small-8`}>

                        <div className={`row`}>
                            <div className={`column`}>
                                <svg viewBox="0 0 51 33" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                    <style>
                                        {`
                                            .speedometer {
                                                fill: white;
                                                height: 100%;
                                                width: 100%;
                                            }
                                        `}
                                    </style>
                                    <defs>
                                        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-1">
                                            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                                            <feGaussianBlur stdDeviation="0.25" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
                                            <feMerge>
                                                <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                                                <feMergeNode in="SourceGraphic"></feMergeNode>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <g id="speedometer" stroke="none" stroke-width="1" fill-rule="evenodd" className="speedometer" filter="url(#filter-1)" transform="translate(1.000000, 0.000000)">
                                        <path d="M25.2631579,3.59298246 C13.4736842,3.59298246 3.87368421,13.1929825 3.87368421,24.9824561 C3.87368421,25.9929825 3.0877193,26.7789474 2.07719298,26.7789474 C1.06666667,26.7789474 0.280701754,25.9929825 0.280701754,24.9824561 C0.280701754,21.6140351 0.954385965,18.3578947 2.24561404,15.2701754 C3.48070175,12.2947368 5.27719298,9.6 7.57894737,7.35438596 C9.88070175,5.05263158 12.5192982,3.25614035 15.4947368,2.02105263 C18.5824561,0.729824561 21.8385965,0.0561403509 25.2070175,0.0561403509 C28.5754386,0.0561403509 31.8315789,0.729824561 34.9192982,2.02105263 C36.322807,2.58245614 37.6140351,3.3122807 38.8491228,4.15438596 L34.9754386,6.06315789 C32.1122807,4.43508772 28.8,3.59298246 25.2631579,3.59298246 L25.2631579,3.59298246 L25.2631579,3.59298246 Z M48.2807018,15.2140351 C47.3263158,13.0245614 46.0912281,10.9473684 44.6315789,9.15087719 L42.8350877,12.8 C45.2491228,16.2807018 46.6526316,20.4350877 46.6526316,24.9824561 C46.6526316,25.9929825 47.4385965,26.7789474 48.4491228,26.7789474 C49.4596491,26.7789474 50.245614,25.9929825 50.245614,24.9824561 C50.245614,21.6140351 49.5719298,18.3017544 48.2807018,15.2140351 L48.2807018,15.2140351 L48.2807018,15.2140351 Z M19.4245614,17.3473684 C20.154386,16.6175439 20.9964912,16.0561404 21.8947368,15.6631579 L21.8947368,15.6631579 L43.3964912,5.10877193 L32.8421053,26.6105263 L32.8421053,26.6105263 C32.4491228,27.5087719 31.8877193,28.3508772 31.1578947,29.0807018 C29.5298246,30.7087719 27.4526316,31.4947368 25.3192982,31.4947368 C23.1859649,31.4947368 21.1087719,30.7087719 19.4807018,29.0807018 C16.1684211,25.8245614 16.1684211,20.5473684 19.4245614,17.3473684 L19.4245614,17.3473684 L19.4245614,17.3473684 Z M22.4,26.0491228 C23.1859649,26.8350877 24.2526316,27.2280702 25.2631579,27.2280702 C26.2736842,27.2280702 27.3403509,26.8350877 28.1263158,26.0491228 C29.6982456,24.477193 29.6982456,21.8947368 28.1263158,20.2666667 C27.3403509,19.4807018 26.2736842,19.0877193 25.2631579,19.0877193 C24.1964912,19.0877193 23.1859649,19.4807018 22.4,20.2666667 C20.8280702,21.8947368 20.8280702,24.477193 22.4,26.0491228 L22.4,26.0491228 L22.4,26.0491228 Z"></path>
                                    </g>
                                </svg>
                                <h5>Hi, {user.firstName} {user.lastName}!</h5>
                                <p>Welcome to your<br/> {user.role.description} Dashboard.</p>
                            </div>
                        </div>

                        <div className={`row`}>
                            <div className={`column`}>
                                <Link to={routes.groupsPage.home} className={`button chunky tangerine dxtrack-user-action`} data-dx-desc={"Open create a group modal"} onClick={this.showCreateGroupModal}>Create a class</Link>
                                <span className={`dxtrack-user-action`} onClick={this.closeModal} data-dx-desc={"Go to Dashboard"}>No thanks. Just take me to my dashboard.</span>
                            </div>
                        </div>

                    </div>
                </div>
            </Modal>
        );
    }
}

UpdateUserProfileSuccessModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        appData: state.appData,
        user: state.user
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
)(UpdateUserProfileSuccessModal);