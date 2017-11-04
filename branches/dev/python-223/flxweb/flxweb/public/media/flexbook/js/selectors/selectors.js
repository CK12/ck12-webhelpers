
import { createSelector } from 'reselect';
import {extractTermsFromBrowseTerms, getArtifactCreator, isChapter, isMobile} from '../utils/utils';
import {processSectionContent} from '../utils/artifact';
import {ATBIMAGEICON,TEACHER} from '../constants/constants';
import * as ArtifactTypes from '../constants/artifactTypes';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';

const getSectionInfoByPosition = (position = '', toc = {}, revisions = {}) => {
  let info = revisions[toc[position]];
  return info || {};
};

export const getRevisions = (state) => state.flexbookTOC && state.flexbookTOC.revisions;
export const getTOC = (state) => {
  return state && state.flexbookTOC && state.flexbookTOC.toc;
};
export const getPublishStatus = (state) => {
  return state && state.flexbookTOC && state.flexbookTOC.publishStatus;
};
export const getSummaries = (state) => {
  return state && state.flexbookTOC && state.flexbookTOC.summaries;
};
export const getCurrentPosition = (state) => state.currentTOCSection;
export const isBookLoaded = (state) => state.flexbookTOC.loaded;
export const getErrorInfo = (state) => state.flexbookTOC.errorInfo;
export const getDraftDetails = (state) => state.flexbookTOC.draftDetails;
export const getLoggedInUserInfo = (state) => state.userInfo;
export const getRecommendedModalities = (state) => state.recommendedModalities;
export const getVocabularyLanguage = (state) => state.vocabularyLanguage;
export const getGroups = (state) => state.groups.groups;
export const areGroupsLoaded = (state) => state.groups.groupsLoaded;
export const getSharedInfo = (state) => state.flexbookTOC.shareInfo;
export const getPractice = (state) => state.practice || {};
export const getFetchLibraryContent = (state) => state.addToFlexBook;
export const getFeedback = (state) => state.feedback;
export const getMessageToUsers = (state) => state.flexbookTOC.messageToUsers;
export const getContentAddedResponse = (state) => state.addToLibrary;
export const getGeneratedPDF = (state) => state.generatePDF || {};
export const getGroupEditingDetails = (state) => state.groupEditingDetails;
export const getPDFDownloadInfo = (state) => state.PDFDownloadInfo;

export const getLocationInfo = (state) => {
  return{
    location: state.location,
    ...state.locationInfo
  };
};

export const isLatestBook = createSelector(
  getLocationInfo,
  (locationInfo) => locationInfo.isLatest
);

export const getAssessmentScoreCard = createSelector(
  getPractice,
  (practice) => practice.score
);

export const getPracticeHandle = createSelector(
  getPractice,
  (practice) => practice.handle
);

export const getPracticeToggle = createSelector(
  getPractice,
  (practice) => practice.toggle
);

export const getReviews = createSelector(
  getFeedback,
  (feedback) => feedback.reviews
);

export const getReplies = createSelector(
  getFeedback,
  (feedback) => feedback.replies && feedback.replies.userRepliesMap
);

export const isChapterPosition = createSelector(
  getCurrentPosition,
  (position) =>
    isChapter(position)
);


export const getClasses = createSelector(
  getGroups,
  (groups) => {
    return groups.filter((g)=> {return g.groupType=='class';});
  }
);

export const getChapters = createSelector(
  getTOC,
  (toc) => {
    let sections = Object.keys(toc);
    return sections.filter((section)=>{
      let parts = section.split('.');
      return (parts[1] == 0) && (parts[0] != 0);
    });
  }
);

export const fetchingFlexbookDetails = createSelector(
  getRevisions,
  (revisions) => revisions.loading
);


export const getProcessedContents = (state) => {
  return getCurrentSectionInfo(state).processedContents;
};

export const getProcessedSectionContents = createSelector([getProcessedContents],processSectionContent);
export const isUserLoggedIn = createSelector([getLoggedInUserInfo], (userInfo) => userInfo);
export const getLoggedInUserId = createSelector(getLoggedInUserInfo, (userInfo) => userInfo.id);

export const getCurrentSectionInfo = createSelector(
  [getCurrentPosition, getTOC, getRevisions],
  getSectionInfoByPosition
);

//returns the currently selected artifact reference from state
export const getCurrentSectionArtifact = (state) => {
  return  getCurrentSectionInfo(state).artifact || {loaded: false};
};

export const getCurrentSectionArtifactID = (state) => {
  return  getCurrentSectionArtifact(state).id;
};

export const getSectionTitle = (state) =>
getCurrentSectionArtifact(state).title;

export const getCurrentSectionMetadata = (state) => {
  return getCurrentSectionArtifact(state).browseTerms || [];
};

export const getVocabularies = (state) => {
  return getCurrentSectionArtifact(state).vocabularies || [];
};

export const getArtifactID = createSelector(
  [getCurrentSectionArtifact],
  (artifact) => artifact && artifact.id
);

export const getCurrentArtifactID = createSelector(
  [getCurrentPosition, getTOC],
  (position, toc) => toc[position]
);

export const getCurrentArtifactType = createSelector(
  [getCurrentSectionArtifact],
  (artifact) => {
    let {type:{name: artifactType}} = artifact;
    if(!artifactType)
      artifactType = artifact.type;
    return artifactType;
  }
);

export const getCurrentArtifactRevisionID = createSelector(
  [getCurrentSectionArtifact],
  (artifact) => artifact.revisionID || artifact.revisions[0].id
);

export const isArtifactPublished = createSelector(
  [getCurrentSectionArtifact,getPublishStatus],
  (artifact, publishStatus) =>
    (artifact.revisions && artifact.revisions[0].publishedTime) || publishStatus
);

export const getCurrentID = createSelector(
  [getCurrentPosition, getTOC, getRevisions],
  (position, toc, revisions) => {
    let rev = revisions[toc[position]] || {},
      artifact = rev.artifact || {};
    return artifact.id;
  }
);

export const getAuthors = createSelector(
  [getCurrentSectionArtifact],
  (artifact) => {
    return artifact.authors || [];
  }
);

export const getLevel = createSelector(
  [getCurrentSectionArtifact],
  (artifact) => {
    let {browseTerms = []} = artifact;
    let level = (browseTerms.filter((term)=>{return term.type.name == 'level';}) || [])[0] || {};
    return level.name || 'Basic';
  }
);


//returns the flexbook artifact reference from the state
export const getFlexBookArtifact = createSelector(
  [getTOC, getRevisions],
  (toc, revisions) =>  getSectionInfoByPosition('0.0', toc, revisions).artifact
);

export const getBookBrowseTerms = createSelector(
  [getFlexBookArtifact],
  (book) => book.browseTerms);

export const getFlexBookDomain = createSelector(
    [getBookBrowseTerms], (browseTerms) => {
      return extractTermsFromBrowseTerms('domain', browseTerms);
    }
  );

export const getFlexBookSubjects = createSelector(
      [getBookBrowseTerms], (browseTerms) => {
        return extractTermsFromBrowseTerms('subject', browseTerms);
      }
    );

export const getDomainCollectionContext = createSelector(
  [getCurrentSectionArtifact], (artifact) =>{
    let {domainCollectionContexts = []} = artifact;
    return domainCollectionContexts;
  }
);

export const getCollectionNode = createSelector(
  [getDomainCollectionContext],
  (domainCollectionContexts) => {
    let collectionNode = domainCollectionContexts.find((term)=>{
      return !!term.collectionContext;
    })|| {};
    return collectionNode;
  }
);

export const getCollectionInfo = createSelector(
  [getCollectionNode],
  (node) => node.collectionContext || []
);

export const getDomainNode = createSelector(
  [getDomainCollectionContext],
  (domainCollectionContexts) => {
    let domainNode = domainCollectionContexts.find((term)=>{
      let {status} = term.domain;
      return status == 'published';
    }) || {};
    return domainNode;
  }
);

export const getSectionDomain = createSelector(
  [getDomainNode],
  (node) => node.domain && node.domain.handle
);

export const getArtifactRecommendedModalities = createSelector(
  [getSectionDomain, getRecommendedModalities],
  (domain, recommendedModalities) => {
    return recommendedModalities[domain] || [];
  }
);

export const getCoverImage = (state) =>{
  let resources = state.resources;
  let coverImage = (resources && resources.filter((resource)=>resource.type.name=='cover page')[0] || {}).satelliteURL;
  coverImage = ( coverImage ) ? coverImage : (typeof resources != 'undefined') ? ATBIMAGEICON : null;
  if(coverImage && coverImage.search('COVER_PAGE') != -1){
    coverImage = coverImage.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_LARGE_TINY');
  }else if(coverImage && coverImage.search('BIMAGE') != -1){
    coverImage =  coverImage.replace(/BIMAGE/g,'BIMAGE_THUMB_LARGE_TINY');
  }
  return coverImage;
};

export const selectStandards = (state) => {
  return state.standards.standards;
};

export const getSelectedStandard = (state) => {
  return state.standards.selectedStandard;
};

export const getArtifactStandards = createSelector(
  [getArtifactID, selectStandards],
  (artifactID, standards) => {
    return standards[artifactID];
  }
);

export const getType = (state) => state.type;

export const isModality = createSelector(
  [getCurrentSectionArtifact],
  (artifact) => {
    let type = artifact.type || {};
    return type.isModality;
  }
);
  //get next section position
export const getNextSectionPosition = createSelector(
    [getCurrentPosition, getTOC],
    (pos, toc) => {
      let sections = Object.keys(toc),
        lastPos = sections.length - 1;
      if (pos == sections[lastPos])
        return null;
      return sections[sections.indexOf(pos) + 1]|| '';
    }
  );


  //get previous section position
export const getPreviousSectionPosition = createSelector(
    [getCurrentPosition, getTOC],
    (pos, toc) => {
      let sections = Object.keys(toc);
      if (pos === '0.0') { return null; }
      //let {prevPos} = artifact;
      return sections[sections.indexOf(pos) - 1] || '';
    }
  );


export const getPreviousSectionInfo = createSelector(
    [getPreviousSectionPosition, getTOC, getRevisions],
    (pos, toc, rev) => {
      let info = getSectionInfoByPosition(pos, toc, rev);
      if (info){
        return {
          ...info,
          position: pos
        };
      }
    }
  );

export const getNextSectionInfo = createSelector(
    [getNextSectionPosition, getTOC, getRevisions],
    (pos, toc, rev) => {
      let info = getSectionInfoByPosition(pos, toc, rev);
      if (info){
        return {
          ...info,
          position: pos
        };
      }
    }
  );

export const getLoggedInUserRoles = createSelector(
    [getLoggedInUserInfo],
    (userInfo) => {
      if(userInfo.roles)
      {
        return userInfo.roles.map( (roleInfo) => roleInfo.name );
      }
      return {};
    }
);

export const getLastSubject = createSelector(
  [getFlexBookDomain],
  (domains) => {
    let subject = '';
    domains.forEach((domain)=>{
      subject = domain.handle;
    });
    return subject;
  }
);
export const userHasRole = (state, role) => {
  let userRoles = getLoggedInUserRoles(state);
  return includes(userRoles,role);
};

export const getArtifactCreatorID = createSelector(
    getCurrentSectionArtifact,
    (artifact) => artifact && artifact.creator && artifact.creator.id
  );

export const isCustomFlexBook = createSelector(
  getLocationInfo,(locationInfo)=> locationInfo.artifactCreator
);

export const isSectionArtifact = createSelector(
  [getCurrentSectionArtifact],(artifact) =>{
    let {type: artifactType} = artifact;
    if(typeof(artifactType) == 'object')
      artifactType = artifactType.name;
    return includes(ArtifactTypes.SECTION_TYPES, artifactType);
  }
);

export const isSectionDraft = createSelector(
  [getCurrentSectionArtifact,], (artifact) =>{
    let {hasDraft, isDraft} = artifact;
    return hasDraft || isDraft;
  }
);

export const isOwner = createSelector(
  [getLocationInfo, isUserLoggedIn],
  (locationInfo, userLoggedIn) => {
    let {loggedIn, login} = userLoggedIn;
    let {artifactCreator} = locationInfo;
    if(loggedIn)
    {
      return artifactCreator ? artifactCreator == login : 'ck12editor' == login;
    }
    return false;
  }
);

export const newPracticeCriteria = createSelector(
  [isSectionArtifact, getLoggedInUserRoles, isCustomFlexBook],
  (isSection, userRoles, isCustom) =>{

    // Only when Artifact Type is Section or Lesson and User Role is student
    return (!isCustom && !includes(userRoles,TEACHER)
      && !isMobile() && isSection);
  }
);

export const isPracticeLoading = createSelector(
  [newPracticeCriteria, getPractice],
  (practiceCriteria, practice) =>{
    if(practiceCriteria) {
      return practice.loading;
    }
    return false;
  }
);

export const showPracticeBadge = createSelector(
  [getPractice, getLoggedInUserRoles, isSectionArtifact, isCustomFlexBook],
  (practice, userRoles, isSection, isCustom) =>{
    let {url:practiceUrl, score:assessment} = practice;
    return (((includes(userRoles,TEACHER) || !!isCustom || isMobile()) && !isEmpty(assessment)) || practiceUrl!='') && isSection;
  }
);

export const isNewSideNavigationBar = createSelector(
  [newPracticeCriteria, getAssessmentScoreCard,getPracticeHandle],
  (practiceCriteria, assessment,handle) => {
    if(practiceCriteria && handle && !isEmpty(assessment)){
      return true;
    }
    return false;
  }
);

export const isSectionOwned = createSelector([getCurrentSectionInfo, isUserLoggedIn],
  (info,userLoggedIn) =>{
    let {artifact:{creator}} = info;
    return creator && creator.login == userLoggedIn.login;
  });

export const getCustomizeOptions = createSelector(
  [getCurrentSectionInfo, isOwner, getGroupEditingDetails, getLocationInfo,isSectionDraft, isSectionOwned],
  (info, isOwned, groupEditingDetails, locationInfo, isDraft, isSectionOwner) => {
    let {isColloborater, isAssignee} = groupEditingDetails;
    let bookInfo = {},
      chapterInfo = {},
      sectionInfo = {},
      {artifact: {type: infoType}, loaded} = info,
      {artifactType} = locationInfo,
      type, object;
    type = loaded? infoType.name: infoType;
    artifactType == 'book' && (bookInfo.isBook = true);
    artifactType == 'chapter' && (chapterInfo.isChapter = true);

    if(type == 'book')
    {
      (isColloborater || isOwned) && !bookInfo.creator && (bookInfo.creator = locationInfo.realm+'/');
      object = bookInfo;
      object.isOwned = isOwned;
    }
    else if(type == 'chapter')
      object = chapterInfo;
    else{
      bookInfo.isOwned = isOwned;
      chapterInfo.isChapter = false;
      chapterInfo.isLatest = true;
      (isOwned || isAssignee) && !sectionInfo.creator && (sectionInfo.creator = locationInfo.realm+'/');
      sectionInfo.isDraft = isDraft;
      sectionInfo.isOwned = isSectionOwner;
      object = sectionInfo;
    }
    object.isColloborater = isColloborater;
    object.isAssignee = isAssignee;

    loaded && setLatest(object, info);
    loaded && setArtifactDetails(object, info);
    if(sectionInfo.isLatest)
    {
      bookInfo.isLatest = sectionInfo.isLatest;
    }
    if(sectionInfo.isDraft)
    {
      bookInfo.hasDraft = sectionInfo.isDraft;
    }
    return {bookInfo, chapterInfo, sectionInfo};
  });

const setLatest = (object, info) => {
  let {artifact: {revisions}} = info,
    revision = revisions && revisions[0] || {};
  object.isLatest = revision.isLatest;
};

const setArtifactDetails = (object, info) => {
  let {artifact: {revisions, handle, type: {name}}} = info,
    revision = revisions && revisions[0] || {},
    {no} = revision;
  object.revisionNo = no;
  object.handle = handle;
  object.artifactType = name;
  !object.creator && (object.creator = getArtifactCreator(info.artifact));
};
