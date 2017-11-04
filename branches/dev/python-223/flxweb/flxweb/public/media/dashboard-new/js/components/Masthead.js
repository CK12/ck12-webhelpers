import React, {PropTypes} from 'react';
import { get } from 'lodash';
import Tooltip from 'components/common/Tooltip';

import { hideTutorial } from 'actions/tutorialActions';
import { saveAppData } from 'actions/appDataActions';
import { tutorialPaths, getPageKey } from 'utils/tutorial';

import styles from 'scss/components/Masthead';

const Masthead = (props) => {
    const buttonText = 'Back to old dashboard';
    const { postFeedback, openTutorial, tutorial, dispatch, appData, location } = props;

    const isActiveTooltip = get(tutorial, tutorialPaths.mastheadTutorial);

    return (
        <div className={`row row--fullWidth ${styles.masthead}`}>
            <div className={`column small-12`}>
                <div className={`row align-right align-middle ${styles.backToOldButtonRow}`}>
                    <div className={`column`}>
                        <a href="/my/dashboard/student/" className={`${styles.backToOldButton} dxtrack-user-action float-right hide`} data-dx-desc={buttonText}>{buttonText}</a>
                    </div>
                </div>
                <div className={`row align-right align-middle collapse ${styles.backToOldButtonRow}`}>
                    <div className={`column shrink`}>
                        <div className={`${styles.actionContainer} dxtrack-user-action`} data-dx-desc={`Post feedback`} onClick={postFeedback}>
                            <i className={`${styles.icon} ${styles.feedbackIcon}`}></i>
                            <span>Feedback</span>
                        </div>
                    </div>
                    <div className={`column shrink relative`}>
                        <div className={`${styles.actionContainer} dxtrack-user-action`} data-dx-desc={`Tutorial`} onClick={openTutorial}>
                            <i className={`${styles.icon} icon-Info`}></i>
                            <span>Tutorial</span>
                        </div>
                        {isActiveTooltip ? <TutorialTooltip dispatch={dispatch} appData={appData} location={location} /> : null}
                    </div>
                </div>
            </div>
        </div>
    );
};


Masthead.propTypes = {
    postFeedback: PropTypes.func.isRequired,
    openTutorial: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    tutorial: PropTypes.object.isRequired,
    appData: PropTypes.object.isRequired
};

const TutorialTooltip = (props) => {
    const {dispatch, appData} = props;

    const onClick = ()=>{
        dispatch(hideTutorial());

        saveAppData(dispatch, appData, {
            userdata: {
                seenNewTeacherDashboard: true,
                [getPageKey(props)]: true
            }
        });

    };
    const arrowStyle = {
        position: 'absolute',
        right: '2.5rem'
    };

    return (
        <div className={styles.tutorialTooltip}>
            <Tooltip arrowStyle={arrowStyle}>
                <div className='row align-center'>
                    <div className='column small-11'>
                        <div>You can always reopen the tutorial for this page here.</div>
                        <button className={'button tangerine rounded small'} onClick={onClick}>OK</button>
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};

export default Masthead;
