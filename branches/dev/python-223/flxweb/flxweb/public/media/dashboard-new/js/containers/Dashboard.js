import React, { PropTypes } from 'react';
import { get, throttle, debounce, isBoolean } from 'lodash';
import { connect } from 'react-redux';
import { Promise } from 'bluebird';

import QueueableComponent from 'components/base/QueueableComponent';

import { ControlCenter, ModalRoot, MessageBoxRoot,MessageTextRoot } from 'containers';
import { UserMenu, Masthead } from 'components';

import { showModal } from 'actions/modalActions';

import * as userActions from 'actions/userActions';
import * as userSubjectsActions from 'actions/userSubjectsActions';
import * as userGradesActions from 'actions/userGradesActions';
import * as subjectsActions from 'actions/subjectsActions';
import * as reportIssueActions from 'actions/reportIssueActions';
import * as appDataActions from 'actions/appDataActions';

import { renderChildren } from 'utils/react';
import { showTutorial } from 'utils/tutorial';
import browser from 'utils/browser';

class Dashboard extends QueueableComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showUserNameAndLocation: false
        };

        this.handleNewUser           = this.handleNewUser.bind(this);
        this.postFeedback            = this.postFeedback.bind(this);
        this.handleScroll            = this.handleScroll.bind(this);
        this.setupScroll             = this.setupScroll.bind(this);
        this.openTutorial            = this.openTutorial.bind(this);
        this.showUserNameAndLocation = this.showUserNameAndLocation.bind(this);

        this.throttledScroll      = throttle(this.handleScroll, 50);
        this.debouncedScrollSetup = debounce(this.setupScroll, 100);
    }

    preload(type = 'add'){
        // Prevents CSS transitions from showing on page load
        document.body.classList[type]('preload');
    }

    componentDidMount(){
        super.componentDidMount();

        Promise.all([this.props.fetchUser(), this.props.fetchAppData()])
            .then(this.showUserNameAndLocation)
            .then(this.handleNewUser);

        this.props.fetchSubjects();
        this.props.fetchUserSubjects();
        this.props.fetchUserGrades();
        this.props.fetchAtrifactForReportIssue();
        this.queue.add(
            setTimeout( ()=> this.preload('remove'), 3000),
            setTimeout( ()=> {
                this.setupScroll(true);
                window.addEventListener('scroll', this.throttledScroll);
                window.addEventListener('resize', this.debouncedScrollSetup);
            }, 1000),
            setTimeout( ()=> {
               const {location} = this.props;
               if(location.query && location.query["scroll"]){
            	   window.scrollTo(0,350);
               }
            }, 2000)
        );
        if(window.$){
        	$(window).off("wheel").on("wheel",function(e){
        		//Bug: 54655 Event added to enable scrolling in subject-picker.
        	})
        }
    }

    componentWillMount(){
        this.preload();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener('scroll', this.throttledScroll);
        window.removeEventListener('resize', this.debouncedScrollSetup);
    }

    setupScroll(isFirstTime=false){
        if(isBoolean(isFirstTime) && isFirstTime){
            this.headerRect        = document.querySelector('header').getBoundingClientRect();
            this.userMenu          = document.querySelector('.userMenu');

            this.menusHolder       = document.querySelector('.menus');
            this.menusHolderRect   = this.menusHolder.getBoundingClientRect();

            this.controlCenter     = this.menusHolder.querySelector('.controlCenter');
            this.controlCenterRect = this.controlCenter.getBoundingClientRect();

            this.pageSubmenuRect   = this.menusHolder.querySelector('.pageSubmenu').getBoundingClientRect();

            this.offsetTop         = this.controlCenter.offsetTop;

        // When not fixed
        } else if(this.controlCenter.offsetTop > 100) {
            this.offsetTop = this.controlCenter.offsetTop;
            this.controlCenterRect = this.controlCenter.getBoundingClientRect();
        }

        this.handleScroll();
    }

    handleScroll(){
        const { menusHolder, offsetTop, menusHolderRect, controlCenterRect, headerRect} = this;
        const { scrollY, innerWidth } = window;
        const controlCenterHeightTriggerPoint = controlCenterRect.height - 39; // 39 is the page submenu height after transitioning
        const triggerPoint = offsetTop + controlCenterHeightTriggerPoint - headerRect.height;

        if( browser.isIE11 || browser.isSafari ){ return; } // Do not allow the scrolling effect

        if(scrollY > triggerPoint && innerWidth > 767){ // 767 is a smaller device resolution
            this.userMenu.style.marginBottom = `${menusHolderRect.height}px`;
            menusHolder.classList.remove('menus--normal');
            menusHolder.classList.add('menus--fixed');

        } else if( scrollY <= triggerPoint ) {
            this.userMenu.style.marginBottom = '0px';
            menusHolder.classList.remove('menus--fixed');
            menusHolder.classList.add('menus--normal');
        }
    }

    handleNewUser(){
        const {
            dispatch,
            user: {isProfileUpdated},
            appData: {userdata: {seenNewTeacherDashboard}}
        } = this.props;

        if(!isProfileUpdated){
            dispatch(showModal({
                modalType: 'UpdateUserProfileModal',
                modalProps: {
                    preventOverlayClick: true,
                    hideCloseButton: true
                }
            }));
        } else if(!seenNewTeacherDashboard){
            dispatch(showModal({
                modalType: 'UpdateUserProfileSuccessModal',
                modalProps: {
                    preventOverlayClick: true,
                    hideCloseButton: true
                }
            }));
        }
    }

    showUserNameAndLocation(){
        this.setState(Object.assign({}, this.state, {
            showUserNameAndLocation: true
        }));
    }

    postFeedback(){
        const { dispatch ,reportIssue} = this.props;
        dispatch(showModal({
            modalType: 'PostFeedbackModal',
            modalProps: {
                preventOverlayClick: true,
                hideCloseButton: false,
                imageLists:[],
                isActive:'',
                reportIssue
            }
        }));
    }
    openTutorial(){
        showTutorial(this.props);
    }
    getPageContent(pageContent){
        // React router nests components into one another.
        // Since we have two menus going on at a time on the same page we need to make
        // sure that the corrent "subpage" element is being used
        // This currently only checks one level of nested routes

        if( get(pageContent, 'props.children', false)) {
            return pageContent.props.children;
        } else if ( get(pageContent, 'props.pageContent', false) ){
            return pageContent.props.pageContent;
        } else {
            return pageContent;
        }
    }

    render() {
        const {
            dispatch,
            location,
            user,
            userSubjects,
            tutorial,
            appData,

            main,
            pageContent,
            children,
            submenu
        } = this.props;

        const { showUserNameAndLocation } = this.state;

        return (
            <div>
                <Masthead
                    postFeedback={this.postFeedback}
                    openTutorial={this.openTutorial}
                    dispatch={dispatch}
                    location={location}
                    tutorial={tutorial}
                    appData={appData}
                />
                <UserMenu user={user} userSubjects={userSubjects} dispatch={dispatch} location={location} showUserNameAndLocation={showUserNameAndLocation} />

                <div className={`menus`}>
                    <ControlCenter appData={appData} location={location} />

                    {/* Render Submenu */}
                    {renderChildren(submenu, {dispatch, location})}
                </div>

                {/* Render Page Specific Content */}
                {
                    renderChildren((main || children), {
                        pageContent: this.getPageContent(pageContent),
                        location
                    })
                }

                <ModalRoot location={location} />
                <MessageBoxRoot />
                <MessageTextRoot />
            </div>
        );
    }
}

Dashboard.propTypes = {
    dispatch: PropTypes.func.isRequired,
    appData: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    userSubjects: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    subjects: PropTypes.object.isRequired,
    tutorial: PropTypes.object.isRequired,

    main: PropTypes.element,
    children: PropTypes.element,
    pageContent: PropTypes.element,
    submenu: PropTypes.element
};


const mapStateToProps = (state) => {
    return {
        appData: state.appData,
        user: state.user,
        userSubjects: state.userSubjects,
        subjects: state.subjects,
        reportIssue:state.reportIssue,
        tutorial: state.tutorial
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        fetchUser: () => {
            return userActions.fetchUser(dispatch);
        },
        fetchAppData: () => appDataActions.fetchAppData(dispatch),
        fetchAtrifactForReportIssue: () => {
            reportIssueActions.fetchAtrifactForReportIssue(dispatch);
        },
        fetchSubjects: () => {
            subjectsActions.fetchSubjects(dispatch);
        },
        fetchUserSubjects: ()=> {
            userSubjectsActions.fetchUserSubjects(dispatch);
        },
        fetchUserGrades: ()=> {
            userGradesActions.fetchUserGrades(dispatch);
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dashboard);
