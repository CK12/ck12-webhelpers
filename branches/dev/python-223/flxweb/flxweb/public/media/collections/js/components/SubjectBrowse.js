import React from 'react'; // eslint-disable-line no-unused-vars
import BrowseBreadcrumbs from './BrowseBreadcrumbs';
import {subjectInfo as ck12SubjectInfo} from 'ck12-subjects';
import flxwebSubjectInfo from '../config/subjectInfo';
import merge from 'lodash/merge';
import SubjectItem from './SubjectItem';

let subjectInfo = merge({}, ck12SubjectInfo, flxwebSubjectInfo);

const SubjectBrowse = (props) => {
  let branches = props.branches.map((branch)=>{
    return (
        <div key={`subject-browse-${branch.handle}`} className="small-12 large-4 columns left subject-wrapper">
          <SubjectItem {...branch} />
        </div>
    );
  });

  return (
    <div className="small-12 columns">
      <div id="resources_container" className="browse relative desktop_view">
        <section id="resources" className="clearfix row" name="resources" style={{padding:'0px'}}>
          <div id="browse_contentwrap" className="row collapse subject-container">
            <div>
              <BrowseBreadcrumbs collectionTitle={props.subjectTitle} />
            </div>
            {branches}
          </div>
        </section>
      </div>
    </div>
  );
};

export const MathBrowse = () => {
  let mathBranches = Object.keys(subjectInfo.math.branches).map((key)=>{
    return subjectInfo.math.branches[key];
  }).filter((branch)=>branch.showOnSubjectBrowsePage);
  return (
    <SubjectBrowse subjectTitle="Math" branches={mathBranches} />
  );
};

export const ScienceBrowse = () => {
  return (
    <SubjectBrowse subjectTitle="Science" branches={Object.values(subjectInfo.science.branches)} />
  );
};

export const EnglishBrowse = () => {
  return (
    <SubjectBrowse subjectTitle="English" branches={Object.values(subjectInfo.english.branches)} />
  );
};
