import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {subjectInfo as ck12SubjectInfo} from 'ck12-subjects';
import flxwebSubjectInfo from '../config/subjectInfo';
import merge from 'lodash/merge';
import SubjectList from './SubjectList';

let subjectInfo = merge({}, ck12SubjectInfo, flxwebSubjectInfo);

/*
removed 'ALL SUBJECTS' heading from the below code
            <div className="row">
              <div className="small-12 large-12 columns mySubject-title-container">
                <h4 className="mySubject-title">All Subjects</h4>

              </div>
            </div>

*/

const Subjects = () => {
  return (
    <div className="small-12 columns">
      <div id="resources_container" className="browse relative desktop_view">
        <section id="resources" className="clearfix row" name="resources">

            <div className="small-12 large-12 columns hide-for-small resources-container">
              <div className="row collapse">
                <SubjectList {...subjectInfo.math} branchFilter={ (branch)=>branch.showOnLandingPage } />
                <SubjectList {...subjectInfo.science} />
                <SubjectList {...subjectInfo.english} />
                <SubjectList {...subjectInfo._more} />
              </div>
            </div>

            <div className="row all-subjects-container-small" style={{display: 'block'}}>
              <div className="section-container tabs show-for-small" data-section="tabs" data-options="deep_linking: true; one_up: false" >
                <SubjectList {...subjectInfo.math} forSmallBreakpoint={true} isActive={true} />
                <SubjectList {...subjectInfo.science} forSmallBreakpoint={true} isActive={true} />
                <SubjectList {...subjectInfo.english} forSmallBreakpoint={true} isActive={true} />
                <SubjectList {...subjectInfo._more} forSmallBreakpoint={true} isActive={true} />
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Subjects;
