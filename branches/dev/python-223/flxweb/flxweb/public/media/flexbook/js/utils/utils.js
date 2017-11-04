import {getNavOptions} from '../constants/sidenav';
import {getNewNavOptions} from '../constants/newSideNav.js';
import * as constants from '../constants/constants';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import MetadataGrid from '../components/MetadataGrid';
import UAParser from 'ua-parser-js';
import includes from 'lodash/includes';

export const parseUpdatedTime  = (updatedTime) => {
  return updatedTime.replace(/[-:\s]/g, '');
};

export const isMobile = () => {
  var parser = new UAParser();
  let devices = ['mobile','tablet'];
  return parser.getDevice() && includes(devices,parser.getDevice().type);
};

export const isOnlyMobile = () => {
  var parser = new UAParser();
  let devices = ['mobile'];
  return parser.getDevice() && includes(devices,parser.getDevice().type);
};

export const parseBookUrl = (url) => {
  return parseBookPath( url.split('/').splice(3).join('/') );
};

export const parseBookPath = (path) => {
  let fragments = path.split('/').filter((f) => (!!f));
  let pos = 0,
    fragment = '',
    res  ={},
    incr=true,
    tmp;
  while (fragments.length){
    fragment = fragments.shift();
    incr = true;
    if (pos === 0){
      if ( decodeURIComponent(fragment).indexOf('user:') === 0 ){
        //if first fragment starts with user:, it's a realm
        incr = false;
        res['realm'] = decodeURIComponent(fragment);
      } else {
        //otherwise, it's artifactType
        res['artifactType'] = fragment;
      }
    } else if (pos === 1) {
      res['handle'] = fragment;
    } else if (pos === 2) {
      tmp = fragment.match(/r(\d+)/);
      if (tmp){
        incr = false;
        res['revision'] = tmp[1];
      } else if( fragment !== 'section' ) {
        res = {'invalid':true};
      }
    } else if (pos === 3) {
      tmp = fragment.match(/(\d+)\.(\d+)/);
      if (tmp){
        res['chapterPos'] = tmp[1];
        res['sectionPos'] = tmp[2];
      } else {
        res = {'invalid':true};
      }
    }

    if (incr){
      pos = pos + 1;
    }

  }
  return res;
};

export const chunkArray = (source, chunkSize) => {
  if (chunkSize){
    let chunkedArray = [];
    for (let i=0, j=source.length; i<j; i+= chunkSize){
      chunkedArray.push( source.slice(i, i+chunkSize) );
    }
    return chunkedArray;
  } else {
    return source;
  }
};

export const formatName = (name) => {
  if(name==constants.ROOT)
    return constants.HOME;
  return name;
};

export const getPath = (handle) => {
  let host = getHost();
  if(handle == constants.ROOT || handle == constants.HOME)
    return host;
  if(['Mathematics', 'Science', 'science', 'mathematics'].indexOf(handle) >= 0) //create a constant array for browse subjects
    return `${host}/browse`;
  return `${host}/${handle.toLowerCase()}`;
};

export const getHandleFromSubject = (subject) =>{
  return subject.split(' ').join('-').toLowerCase();
};

export const bookLocationInfoToURL = (bookInfo) => {
  let {
    realm,
    handle,
    artifactType,
    revision,
    section,
    modality,
    subject,
    domain,
    isRelatedMod,
    isTeacher,
    isLatest
  } = bookInfo;
  let fragments = [''];

  if(artifactType=='asmtpractice' && !isTeacher && subject && handle)
  {
    return `/assessment/ui/?test/view/practice/${subject.toLowerCase()}/${handle}`;
  }

  if (realm){ fragments.push(realm); }
  if (isRelatedMod && subject && domain){
    fragments.push(subject.toLowerCase());
    fragments.push(domain);
  }
  if(artifactType && handle){
    fragments.push(artifactType);
    fragments.push(handle);
  }else{
    let res = parseBookPath(window.location.pathname);
    fragments.push(res.artifactType);
    fragments.push(res.handle);
  }
  if (!isLatest && revision){ fragments.push('r' + revision); }
  if (section && section!='0.0'){ fragments.push('section/' + section); }
  if(modality){ fragments.push('?referrer=recommended_modalities');}
  fragments.push('');
  return fragments.join('/');
};

export const imageLocationToURL = (imageInfo) => {
  let fragments = '';
  if(imageInfo.src){
    fragments = imageInfo.src;
  }else{
    fragments =   '/media/images/modality_generic_icons/practice_image.png';
  }
  return fragments;
};

const getHost = () => {
  return `${window.location.protocol}\/\/${window.location.hostname}`;
};

export const formatDate = (date) =>{
  try{
    let values = date.split(/[^0-9]/);
    if(values[0]!='' && values[1]!='' && values[2]!='')
    {
      date =  new Date(values[0], values[1]-1, values[2]);
    }
  }
  catch(e){
    date= new Date(date);
  }
  return date.toString().replace(/\S+\s(\S+)\s(\d+)\s(\d+)\s.*/, '$1 $2, $3');
};

export const getSearchPath = (term, type) => {
  var path = `/search/?q=${type}:${term}`;
  return getHost() + path;
};

export const concatFlags = (flags) => flags.map((flag)=>`include${flag}=True`).join('&');

export const concatURLFields = (fragments) => fragments.join('&');

export const capitalize = (name) => name[0].toUpperCase() + name.slice(1);

export const formatHandle = (handle) => {
  if (!handle){handle = '';}
  let match = handle.match(/.+?(?=-::)/);
  if(match){
    match = match[0];
    return match;
  }
  if(handle.indexOf('CK-12')>=0){
    let tokens = handle.split('CK-12');
    tokens = tokens.map((token) => removeHyphens(token));
    return tokens[0] + 'CK-12'+ tokens[1];
  }
  return removeHyphens(handle);
};

export const formatTitle = (title) => {
  if (!title){title = '';}
  let match = title.match(/.+?(?=-::)/);
  if(match){
    match = match[0];
    return match;
  }
  return title;
};

const removeHyphens = (title) => title.split('-').join(' ');

export const formatSectionName = (section) => {
  let regexExpression = section.match(/.+?(?=-::)/);
  regexExpression = (regexExpression) ? regexExpression[0]:section;
  return regexExpression;
};

export const getBookHandle = (locationInfo) => {
  let {realm, handle, revision, isLatest} = locationInfo;
  let bookHandle = realm?`/${realm}`:'';
  bookHandle+= `/book/${handle}`;
  if(!isLatest && revision)
  {
    bookHandle+= `/r${revision}`;
  }
  return bookHandle;
};

export const extractTermsFromBrowseTerms = (name, browseTerms) => {
  if (!browseTerms){browseTerms=[];}
  return browseTerms.filter((term)=> {
    return term.type && term.type.name===name;
  });
};

export const isBookRelatedArtifact = (artifactType) => {
  return (['book','chapter','lesson', 'section'].indexOf(artifactType) >= 0);
};

export const isSectionPosition = (position) => position.split('.')[1] > 0;

export const isChapter = (position) => position!='0.0' && position.split('.')[1] == 0;

export const tocContainsOnlyChapters = (toc) =>{
  let keys =  Object.keys(toc);
  for(let key of keys){
    if(isSectionPosition(key))
      return false;
  }
  return true;
};
export const uniqueElement = (array,selectionScenario) => {
  let arr_list = [];
  let found = {};
  for( let index of array){
    if(!selectionScenario){
      if(!found[index.id]){
        found[index.id] = true;
        arr_list.push(index);
      }
    }else{
      let name = constants.CK12MODALITY.modalities[index.type.name].display_label;
      if(!found[name]){
        arr_list.push(index);
        found[name] = {'index': arr_list.length-1, 'type':index.type.name};
      }else{
        if(selectionScenario.name != found[name]['type']){
          arr_list.splice(found[name]['index'],1);
          arr_list.push(index);
          found[name] = {'index': arr_list.length-1,'type':index.type.name};
        }
      }
    }
  }
  return arr_list;
};


export const sideNavigationList = ({artifact, artifactOwner, isNewSideNav}) => {
  if(isEmpty(artifact))
    return [];
  let {type: artifactType} = artifact;
  if(typeof(artifactType) == 'object')
    artifactType = artifactType.name;
  let orderedOptions = isNewSideNav?getNewNavOptions():getNavOptions(artifactType, artifactOwner, isNewSideNav);
  orderedOptions.sort((first, second) => first.index - second.index);
  return orderedOptions;
};

export const checkResourceAttach = (resources) =>{
  let sourcePDF = '';
  for(let res of resources){
    if(res.type.name == 'pdf'){
      sourcePDF = res.satelliteURL;
      return sourcePDF;
    }
  }
};

export const checkRevisionAdded = (loggInState,revision) => {
  let revisionFound = false;
  if(loggInState && revision){
    let revisionID = revision[0].id;
    let libraryInfos = Array.isArray( revision[0].libraryInfos ) ? revision[0].libraryInfos : [];
    for(let cRev of libraryInfos){
      if(revisionID == cRev.revisionID){
        revisionFound = true;
        break;
      }
    }
  }
  return revisionFound;
};

export const customizeArtifactLink = (artifact,mode) => {
  let artifactLink = '#';
  if(artifact && artifact.revisions){
    let artifactType = artifact.type.name;
    let checkArtifactBelong = getArtifactCreator(artifact);
    artifactLink = '/editor/'+ checkArtifactBelong + artifactType+'/'+artifact.handle+'/r'+ artifact.revisions[0].no;
    artifactLink = (!mode) ? artifactLink : artifactLink + '/#' + mode;
  }
  return artifactLink;
};

export const editArtifactLink = (locationInfo) => {
  let artifactLink = '#';
  let {revision, realm, chapterPos, sectionPos, artifactType, handle} = locationInfo;
  artifactLink = '/editor/' + realm
              + '/' + artifactType
              + '/' + handle
              + '/r' + revision;
  if(chapterPos && sectionPos)
  {
    artifactLink += '/section/' + chapterPos + '.'  + sectionPos;
  }
  return artifactLink;
};

export const getArtifactLink = (artifact) => {
  let link = '#';
  if(artifact && artifact.revisions){
    let artifactType = artifact.type.name;
    link =  '/user:' + artifact.creatorLogin
            + '/' + artifactType
            + '/' + artifact.handle
            +'/r' + artifact.latestRevision;
  }
  return link;
};

export const getFlexbookLink = (flexbook) => {
  let {handle, realm, revision} = flexbook;
  if(handle && realm && revision){
    return '/' + realm + '/book/' + handle + '/r' + revision;
  }
};

export const getArtifactCreator = (artifact) => {
  let artifactOwner = '',
    authors = artifact.authors || [];
  let name = getCreatorName(artifact.creator);
  if(!isEmpty(authors))
  {
    for(let author of authors){
      if(name.trim() == author.name.trim()){
        artifactOwner = (artifact.creator.login != 'ck12editor') ? 'user:'+artifact.creator.login+'/': '';
        return artifactOwner;
      }
    }
  }
  artifactOwner = (artifact.creator.login != 'ck12editor') ? 'user:'+artifact.creator.login+'/': '';
  return artifactOwner;
};

export const getCreatorName = (creator) => {
  let creatorName = '';
  if (typeof creator == 'object'){ //todo temporary fix only
    let {name, surName} = creator;
    creatorName = (surName) ? name + ' ' + surName : name;
  }
  return creatorName;
};

export const validateAndCorrectPosition = (pos) => {
  return pos?(pos.split('.')[1])? pos: pos + '.0': '';
};

export const isEmailValid = (email) => {
  var isValid = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email);
  return isValid;
};

export const sortGrade = (grade) => {
  grade.sort(function (a, b) {
    if (isNaN(a) && !isNaN(b)) {
      return 1;
    }
    else if (isNaN(b) && !isNaN(a)) {
      return -1;
    }
    return a - b;
  });
  return grade;
};

export const createMetadataGrid = (gridType) => {
  return ( {content} ) => <MetadataGrid content={content} type={gridType}/>;
};

export const removePracticeKeyword = (praticeTitle) => {
  return praticeTitle.substring(0,praticeTitle.indexOf('Practice'));
};

export const requireSignin = (returnURL) => {
  if (!returnURL){
    returnURL = window.location.href;
  }
  //console.log('signin required...');
  window.location.href = `/auth/signin?returnTo=${returnURL}`;
};
