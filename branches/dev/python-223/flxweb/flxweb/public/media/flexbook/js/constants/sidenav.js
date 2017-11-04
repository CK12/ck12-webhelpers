import * as ArtifactTypes from './artifactTypes';
import includes from 'lodash/includes';
import concat from 'lodash/concat';
import isEmpty from 'lodash/isEmpty';
import {isMobile} from '../utils/utils';

export const ADD_TO_LIBRARY = 'Add to Library';
export const SHARE_TO_GROUPS = 'Share to Groups';
export const ADD_TO_FLEXBOOK_TEXTBOOK = 'Add to FlexBook® Textbook';
export const CUSTOMIZE = 'Customize';
export const CUSTOMIZE_TITLE = 'Customize this Flexbook';
export const CUSTOMIZE_TITLE_SECTIONS = 'Make a copy of this Modality';
export const EDIT_TITLE = 'Edit this Flexbook';
export const EDIT_TITLE_SECTIONS = 'Edit this Modality';
export const OFFLINE_READER = 'Offline Reader';
export const DOWNLOAD_PDF = 'Download PDF';
export const ASSIGN_TO_CLASS = 'Assign to Class';
export const PUBLISH = 'Publish';
export const PUBLISHED = 'Published';
export const OWNER = 'OWNER';
export const QUICK_TIPS = 'QUICK_TIPS';
export const OPEN_APP = 'Open in App';

const bookOptions = [{index: 1, label: ADD_TO_LIBRARY, title: ADD_TO_LIBRARY},{index: 2, title:SHARE_TO_GROUPS, label: SHARE_TO_GROUPS},{index: 3, title: ADD_TO_FLEXBOOK_TEXTBOOK, label: ADD_TO_FLEXBOOK_TEXTBOOK},
  {index: 4, label: CUSTOMIZE, title: CUSTOMIZE_TITLE},{index: 14, label: OFFLINE_READER, title: OFFLINE_READER}],
  sectionOptions = [{index: 1, label: ASSIGN_TO_CLASS, title: ASSIGN_TO_CLASS},{index: 2, label: ADD_TO_LIBRARY, title: ADD_TO_LIBRARY},{index: 3, label: SHARE_TO_GROUPS, title: SHARE_TO_GROUPS},{index: 4, label: ADD_TO_FLEXBOOK_TEXTBOOK, title: ADD_TO_FLEXBOOK_TEXTBOOK},
  {index: 5, label: CUSTOMIZE, title: CUSTOMIZE_TITLE_SECTIONS}, {index: 6, label: QUICK_TIPS},{index: 14, label: OFFLINE_READER, title: OFFLINE_READER}],
  chapterOptions = [{index: 1, label: SHARE_TO_GROUPS, title: SHARE_TO_GROUPS}, {index: 2, label: ADD_TO_FLEXBOOK_TEXTBOOK, title: ADD_TO_FLEXBOOK_TEXTBOOK}, {index: 14, label: OFFLINE_READER, title: OFFLINE_READER}];

const ownerOptions = [{index: 11, label: PUBLISH, title: PUBLISH},{index: 12, label: DOWNLOAD_PDF, title: DOWNLOAD_PDF}];
const mobileOptions = [{index: 13, label: OPEN_APP, title: OPEN_APP}];

export const getNavOptions = (type, isOwner) => {
  let options = isOwner?ownerOptions:[];
  if(includes(ArtifactTypes.BOOK_TYPES, type)){
    options = concat(options, bookOptions);
    if(isMobile())
    {
      options = concat(options,mobileOptions);
    }
  }
  else
  { 
    if(includes(ArtifactTypes.CHAPTER_TYPES, type))
    {
      if(isOwner)
      {
        let index= options.findIndex((option)=>option.label==PUBLISH);
        options = [...options.slice(0,index), ...options.slice(index+1)];
      }
      options = concat(options, chapterOptions);
    }
    else if(includes(ArtifactTypes.SECTION_TYPES, type))
      options = concat(options, sectionOptions);
  }
  return options;
};
