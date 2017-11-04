import React, {Component} from 'react';
import {connect} from 'react-redux';
import BreadcrumbList from '../components/BreadcrumbList';
import {getFlexBookDomain, getFlexBookSubjects, getSectionTitle, isOwner, getFlexBookArtifact} from '../selectors/selectors.js';
import {formatName, formatHandle, getPath, getBookHandle, isSectionPosition, getHandleFromSubject, capitalize} from '../utils/utils';
import {HOME} from '../constants/constants';


class Breadcrumbs extends Component{
  get breadcrumbs(){
    let breadcrumbs = [{label: 'Home', url: getPath(HOME)}];
    let {position, locationInfo, location, domain = [], sectionName, subjects, isArtifactOwner, flexbookName} = this.props,
    bookHandle = getBookHandle(locationInfo);
    subjects = subjects.slice(0,2);
    if(isArtifactOwner){
      breadcrumbs.push({label: 'Library', url: '/my/library'});
    }
    else
    {
      domain.sort((a,b)=>{
        if(a.parentID == b.parentID)
          return a.handle > b.handle;
        return a.parentID > b.parentID;
      });
      let parentIDs = [];
      
      let {artifactType} = locationInfo;
      domain.forEach((d)=>{
        if(parentIDs.indexOf(d.parentID) == -1){
          breadcrumbs.push({label: formatName(d.name), url: getPath(d.handle)});
          parentIDs.push(d.parentID);
        }
      });
      if(artifactType == 'tebook'){
        subjects[0] && breadcrumbs.push({label: capitalize(subjects[0].name), url: getPath(subjects[0].name)});
        subjects[1] && breadcrumbs.push({label: subjects[1].name, url: getPath(getHandleFromSubject(subjects[1].name))});
      }

      if(artifactType == 'book' || artifactType == 'tebook'){
        breadcrumbs.push({label: 'FlexBooks', url: breadcrumbs.slice(-1)[0].url+'#view_books'});
      }
    }

    breadcrumbs.push({label: flexbookName, url: bookHandle, position: '0.0'});
    if(position != '0.0'){
      let [chapter, section] = position.split('.');
      let chapterLocation = `${chapter}.0`;
      breadcrumbs.push({label: `Ch${chapter}`, url: bookHandle+`/section/${chapterLocation}`, position: chapterLocation});
      if(section!=0)
        breadcrumbs.push({label: `${section}. ${formatHandle(sectionName)}`, position: position});
    }

    let last = breadcrumbs.slice(-1)[0];
    if(last){
      last.isInactive = true;
    }
    return breadcrumbs;
  }

  render()
  {
    return <BreadcrumbList data={this.breadcrumbs}/>;
  }
}

const mapStateToProps = (state) =>{
  let {currentTOCSection: position, locationInfo, location} = state;
  let domain = getFlexBookDomain(state),
    subjects = getFlexBookSubjects(state),
    sectionName;
  if(isSectionPosition(position))
    sectionName = getSectionTitle(state);
  let isArtifactOwner = isOwner(state);
  let {title:flexbookName} = getFlexBookArtifact(state);
  return {
    position,
    location,
    locationInfo,
    domain,
    subjects,
    sectionName,
    isArtifactOwner,
    flexbookName
  };
};

const mapDispatchToProps = (dispatch) =>({
  dispatch
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Breadcrumbs);
