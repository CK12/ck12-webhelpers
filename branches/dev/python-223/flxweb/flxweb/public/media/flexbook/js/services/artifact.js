import {Promise} from 'bluebird';
import ck12ajax from 'ck12-ajax';
import {concatURLFields, concatFlags} from '../utils/utils';
import {
  addArtifactToFlexBook,
  createEmptyBookPayload
} from '../utils/artifact';
import isEmpty from 'lodash/isEmpty';

const BASE_URL = '/flx/artifact/';
const BOOK_FLAGS = ['Authors', 'Resources','Children', 'GrandChildren',
  'TagTerms', 'BrowseTerms', 'SearchTerms', 'MessageToUsers','LibraryInfos','DraftInfo','ChildrenDraftInfos'];
const SECTION_FLAGS = ['Authors', 'Resources', 'Children', 'Content',
  'TagTerms', 'ProcessedContent', 'RevisionStandards', 'BrowseTerms', 'SearchTerms', 'Vocabularies','LibraryInfos','DraftInfo','ChildrenDraftInfos', 'DomainCollectionContexts'];

export const fetchBookWOCache = (bookInfo) => {
  let { artifactType, handle: artifactHandle, artifactCreator = 'ck12editor', revision:artifactRevisionNO} = bookInfo;
  let url = getUrl({artifactType, artifactHandle, artifactCreator,artifactRevisionNO});
  return getArtifact(url,false);
};

export const fetchBook = (bookInfo, isCache) => {
  //TODO: add 'flags' argument, use it to set/unset the flag defaults
  let { artifactType, handle: artifactHandle, artifactCreator = 'ck12editor', revision:artifactRevisionNO, updatedTime} = bookInfo,
    flagsString = concatFlags(BOOK_FLAGS);
  let url = getUrl({artifactType, artifactHandle, artifactCreator,artifactRevisionNO, flagsString});
  url += '&u=' + updatedTime;
  return getArtifact(url, isCache);
};

export const fetchDetails = (bookInfo) => {
  let { artifactType, handle: artifactHandle, artifactCreator = 'ck12editor', chapterPos, sectionPos, realm} = bookInfo,
    flagsString = concatFlags(SECTION_FLAGS);
  if (realm && unescape(realm).indexOf('user:') === 0){
    artifactCreator = unescape(realm).split(':')[1];
  }
  let url = getUrl({artifactType, artifactHandle, artifactCreator, descendant: {chapterPos, sectionPos},
    flagsString});
  return getArtifact(url);
};

export const fetchDraft = (revisionID) => {
  let url = `/flx/artifactdraft/artifactDraftArtifactRevisionID=${revisionID}`;
  return getArtifact(url, false);
};
export const fetchArtifact = (revisionID, isCache=true) => {
  let flagsString = concatFlags(SECTION_FLAGS);
  let url = getUrl({artifactRevisionID: revisionID, flagsString});
  if(!isCache)
  {
    url += '&returnDraftIfDraftExists=True';
  }
  return getArtifact(url, isCache);
};

export const fetchFeedback = (bookInfo) => {
  let { artifactType, handle: artifactHandle, artifactCreator = 'ck12editor', chapterPos, sectionPos } = bookInfo;
  let feedback = true,
    flags = ['Helpfuls', 'Reviews', 'AbuseReports','ReviewAbuseReports'];
  let flagsString = concatFlags(flags);
  let url = getUrl({artifactType, artifactHandle, artifactCreator, descendant: {chapterPos, sectionPos}, feedback, flagsString});
  return getArtifact(url,false);
};


export const postFeedback = (data) => {
  let url = '/flx/create/feedback';
  return ck12ajax({url, data, method: 'post'});
};

export const deleteFeedback = (data) => {
  let url = `/flx/delete/myfeedback/${data.id}?type=vote`;
  return ck12ajax({url, method: 'delete'});
};

export const reportFeedbackAbuse = ({artifactID, reviewerID}) => {
  let url = `/flx/create/feedback/abuse/${artifactID}/${reviewerID}`;
  return ck12ajax({url, contentType: 'application/json', method: 'put', data:{artifactID: +artifactID, memberID: reviewerID}});
};

export const replyToFeedback = (data) => {
  let url = '/flx/create/feedbackreview';
  data['type'] = 'vote';
  return ck12ajax({url, data, method: 'post'});
};

export const setFeedbackHelpfulness = (data) => {
  let url = '/flx/create/feedbackhelpful';
  data['type'] = 'vote';
  return ck12ajax({url, data, method: 'post'});
};

export const deleteFeedbackReview = (data) => {
  let url = `/flx/delete/feedbackreview?reviewID=${data.id}`;
  return ck12ajax({url, method: 'delete'});
};

export const reportFeedbackReviewAbuse = ({id}) => {
  let url = `/flx/create/feedbackreview/abuse/${id}`;
  return ck12ajax({url, contentType: 'application/json', method: 'put', data:{reviewID: id}});
};

const getArtifact = (url, cdnCache=true) => {
  return ck12ajax({url, cdnCache}).then( (response) => {
    let [key] = Object.keys(response);
    return response[key];
  });
};

const getUrl = (options) => {
  let { flagsString='', feedback=false, descendant, ...artifactInfo } = options;
  return BASE_URL +  getArtifactInfoString(artifactInfo) + getDescendantString(descendant) + getFeedbackString(feedback) +'?'+ flagsString;
};

const getArtifactInfoString = (artifactInfo) => {
  let fields = [];
  for(let key in artifactInfo){
    if(artifactInfo[key])
      fields.push(`${key}=${artifactInfo[key]}`);
  }
  return concatURLFields(fields);
};

const getDescendantString = (descendant) => {
  if(!descendant || isEmpty(descendant))
    return '';
  let {chapterPos, sectionPos = 0} = descendant;
  if(chapterPos == undefined)
    return '';
  return `/descendant/${chapterPos}.${sectionPos}`;
};

const getFeedbackString = (feedback) =>
  feedback? '/feedbacks' : '';


  //TODO: move into a more generic CK12LibraryService module
export const fetchLibraryFlexBooks = (start = 1, size = 10) => {
  let bookTypes = 'book,tebook,labkit,workbook';
  let optionParms = [];
  let BASE_URL_FETCHBOOK = `/flx/get/mylib/info/${bookTypes}`;
  let options = {
    ownership:'owned',
    sort:'updateTime,desc',
    pageNum:start,
    pageSize:size
  };
  for(let key in options){
    optionParms.push(encodeURI(key) + '=' + encodeURI(options[key]));
  }
  let url = BASE_URL_FETCHBOOK + '?' + optionParms.join('&');
  return ck12ajax(url);
};


export const assembleArtifact = (flexbook) => {
    //Calls assemble artifact API
  let assembleAPI = '/flx/artifact/save';
  let postData = new Buffer(JSON.stringify(flexbook)).toString('base64');
  return ck12ajax({
    url: assembleAPI,
    method:'post',
    contentType:'application/json',
    data: `"${postData}"`
  });
};



const _resolveFlexBook = (flexbook) => {
    //utility method that resolves existing FlexBooks by fetching required details
    //and simply resolves new FlexBooks
    //This also helps unify how old and existing books are processed...
  let {isNew} = flexbook;
  return new Promise( (resolve) => {
    if (isNew){
      let newBook = createEmptyBookPayload(flexbook);
      resolve( newBook );
    } else {
      let resolution = (()=>{
        let {artifactRevisionID:id} = flexbook;
        let url = getUrl({
          artifactRevisionID:id,
          flagsString:concatFlags(['Children'])
        });
        return getArtifact(url);
      })();
      resolve( resolution );
    }
  });
};

export const addToFlexBook = (artifactToAdd, flexbook) => {
  return new Promise( (resolve) => {
    _resolveFlexBook(flexbook).then( (resolvedFlexBook) => {
      let assemblePayload = addArtifactToFlexBook(artifactToAdd, resolvedFlexBook);
      resolve(assembleArtifact(assemblePayload));
    });
  });
};

export const fetchStandards = (artifactID) => {
  return ck12ajax({
    url: `/ajax/artifact/standardboards/${artifactID}`,
    contentType: 'html',
    responseType: 'html'
  });
};


export const fetchStandard = (url) => {
  return ck12ajax({
    url,
    contentType: 'html',
    responseType: 'html'
  });
};

export const publish = (data) => {
  let {artifactRevisionID, type} = data;
  return ck12ajax({
    url: `/flx/publish/revision/${artifactRevisionID}?contributionType=${type}`,
    method:'get'
  });
};

export const fetchPDFDownloadInfo = (artifactID) => {
  return ck12ajax({url:`/flx/get/pdf/download/info?artifactID=${artifactID}`});
};

export const submitPDFDonloadInfo = (data) => {
  return ck12ajax({
    url: '/flx/save/pdf/download/info',
    data,
    method: 'get'
  });
};

window.addToFlexBook = addToFlexBook;
