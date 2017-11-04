import React, { Component, PropTypes } from 'react';
import {Promise} from 'bluebird';
import { connect } from 'react-redux';
import { includes } from 'lodash';

import Loader from 'components/Loader';

import styles from 'scss/components/ContentPage';

import { hasSeenPageTutorial, showTutorial } from 'utils/tutorial';
import {renderChildren} from 'utils/react';

import * as contentActions from 'actions/contentPageActions';
import {FETCH_SIMULATION_SUCCESS} from 'actions/actionTypes';
import { hideTutorial } from 'actions/tutorialActions';
import { setActiveHeader } from 'externals';

let branches = [],collectionHandles = [], subjectLists = [],subjectMapped = false;

class ContentPage extends Component {
    constructor(props, context){
        super(props, context);

        this.state = {
            isLoading: true
        };

        this.fetchModalityTypes = this.fetchModalityTypes.bind(this);
        this.hideLoader = this.hideLoader.bind(this);
    }

    hideLoader(){
        this.setState(Object.assign({}, this.state, {
            isLoading: false
        }));
    }

    componentDidMount(){
    	const {userSubjects,content} = this.props;
    	this.props.fetchStandards();
       if(userSubjects["subjectSuccess"]){
    	   this.fetchModalityTypes();
       }

        const { dispatch } = this.props;
        if(!hasSeenPageTutorial(this.props)){
            showTutorial(this.props);
        } else {
            dispatch(hideTutorial());
        }
        
        document.title = content.title;
        setTimeout(()=>{setActiveHeader("Content")},10) // line added to update active header groups
    }
    componentDidUpdate(){
        const {userSubjects} = this.props;
        if(userSubjects['subjects'] && userSubjects['subjects'].length && !subjectMapped){//do not remove subjectMapped condition
            userSubjects['subjects'].map(item=>{
                if(item['encodedID']){
                    let branch = item['encodedID'].split('.')[1];
                    let collectionHandle = item['name'].replace(/ /g,'-');
                    let subject = item['encodedID'].split('.')[0];
                    if(branches.indexOf(branch) === -1){
                    	branches.push(branch);
                    }
                    if(collectionHandles.indexOf(collectionHandle) === -1){
                    	collectionHandles.push(collectionHandle);
                    }
                    if(subjectLists.indexOf(subject) === -1){
                        subjectLists.push(subject);
                    }
                }
            });
            this.fetchModalityTypes();
            subjectMapped = true;
        }if(userSubjects['subjects'] && userSubjects['subjects'].length === 0 && !subjectMapped && userSubjects['subjectSuccess']){
            this.fetchModalityTypes();
            subjectMapped = true;
        }else{
            let newsubjectLists = [],newBranches = [],newCollectionHandles = [];
            if(userSubjects['subjects']){//do not remove subjectMapped condition
                userSubjects['subjects'].map(item=>{
                    if(item['encodedID']){
                        let branch = item['encodedID'].split('.')[1];
                        let collectionHandle = item['name'].replace(/ /g,'-');
                        let subject = item['encodedID'].split('.')[0];
                        if(newBranches.indexOf(branch) === -1){
                        	newBranches.push(branch);
                        }
                        if(newCollectionHandles.indexOf(collectionHandle) === -1){
                        	newCollectionHandles.push(collectionHandle);
                        }
                        if(newsubjectLists.indexOf(subject) === -1){
                            newsubjectLists.push(subject);
                        }
                    }
                });
            }
            if(newBranches.join(',') !== branches.join(',')){
                subjectLists = Object.assign([],newsubjectLists);
                
                branches = Object.assign([],newBranches);
                collectionHandles = Object.assign([],newCollectionHandles);
                this.fetchModalityTypes();
            }
        }
    }
    fetchModalityTypes(){
        const {
            fetchRecentlyViewedModalities,
            fetchReadModalities,
            fetchVideoModalities,
            fetchPracticeModalities,
            fetchPlixModalities,
            fetchRWAModalities,
            fetchSimulationModalities
        } = this.props;
        
        const _branches = branches.join(',');
        const _collectionHandles = collectionHandles.join(',');
        const _subjects = subjectLists.join(',');
        const _fetchModalityTypes = [
            fetchRecentlyViewedModalities(_collectionHandles),
            fetchReadModalities(_collectionHandles),
            fetchVideoModalities(_collectionHandles),
            fetchPracticeModalities(_collectionHandles),
            fetchPlixModalities(_collectionHandles)/*,
            fetchRWAModalities(_branches)*/
        ];

        if(includes(branches, 'PHY') || includes(branches, 'CHE') || branches.length === 0){ _fetchModalityTypes.push(fetchSimulationModalities(_collectionHandles)); }
        
        //Hiding the loader if any one of the modalities fetch is completed
        	this.hideLoader();
        
        //Hiding the loader if any one of the modalities fetch is completed
    	this.hideLoader();
        
        Promise.all(_fetchModalityTypes).then(()=>{
            const {content} = this.props;
            let _content = Object.assign({},content);
            //this.hideLoader()
            this.props.checkAllInLibrary(_content);
            //if(includes(branches, 'PHY') || includes(branches, 'CHE') || branches.length === 0){
            if(includes(collectionHandles, 'physics') || includes(collectionHandles, 'chemistry') || collectionHandles.length === 0){
                //empty
            }else{
                this.props.setSimulationModalitiesToEmpty()
            }
        });
    }
    render(){
        const { isLoading } = this.state;
        const {pageContent, ...rest} = this.props;

        return (
            <div className={`row row--fullWidth ${styles.page} small-up-1`}>
                <div className={`small-12 columns ${styles.contentBody}`}>
                    { isLoading ?
                        <div className={styles.loader}><Loader/></div> :
                        renderChildren(pageContent, {...rest})
                    }
                </div>
            </div>
        );
    }
}
ContentPage.PropTypes = {
    location: PropTypes.object.isRequired,
    appData: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    content : PropTypes.object.isRequired,
    standards:PropTypes.object.isRequired,
    subjects:PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        content: state.content,
        appData: state.appData,
        standards:state.standards,
        userSubjects:state.userSubjects
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        setContentActiveTab: (content) => dispatch(contentActions.setContentActiveTab(content)),
        fetchStandards: () => {
            return contentActions.fetchStandards(dispatch);
        },
        fetchRecentlyViewedModalities: (subject,branch) => {
            return contentActions.fetchRecentlyViewedModalities(dispatch,subject,branch);
        },
        fetchReadModalities: (branch) => {
            return contentActions.fetchReadModalities(dispatch,branch);
        },
        fetchVideoModalities: (branch) => {
            return contentActions.fetchVideoModalities(dispatch,branch);
        },
        fetchPracticeModalities: (branch) => {
            return contentActions.fetchPracticeModalities(dispatch,branch);
        },
        fetchPlixModalities: (branch) => {
            return contentActions.fetchPlixModalities(dispatch,branch);
        },
        fetchRWAModalities: (branch) => {
            return contentActions.fetchRWAModalities(dispatch,branch);
        },
        fetchSimulationModalities: (branch) => {
            return contentActions.fetchSimulationModalities(dispatch,branch);
        },
        setSimulationModalitiesToEmpty: () => {
            dispatch({
                type: FETCH_SIMULATION_SUCCESS,
                content: {
                    simulationint: []
                }
            });
        },
        checkInLibrary: (info) => {
            contentActions.checkInLibrary(dispatch,info,function(dispatch,info){
                contentActions.placeInLibrary(dispatch,info);
            });
        },
        checkAllInLibrary: ({recentlyViewed,lessons,videos,asmtpractice,plix,simulationint}) => {
            let modalities = {recentlyViewed,lessons,videos,asmtpractice,plix,simulationint},
                artifacts = [],
                artifactRevisions = [];
            for(var i in modalities){
                for(var j in modalities[i]){
                	if(modalities[i][j]['artifactID']){
                		 artifacts.push(modalities[i][j]['artifactID']);
                         artifactRevisions.push('artifactRevision');
                	}
                   
                }
            }
            if(artifacts.length){
            	 contentActions.checkAllInLibrary(dispatch,{artifactID:artifacts.join(','),artifactRevision:artifactRevisions.join(',')});
            }else{
            	return
            }

        },
        placeInLibrary: (info) => {
            contentActions.placeInLibrary(dispatch,info);
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContentPage);