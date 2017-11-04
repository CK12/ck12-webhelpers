import { flexbookTOC } from './flexbookTOC';
import {userInfo} from './userInfo';
import {groups} from './groups';
import {location, locationInfo, currentTOCSection} from './location';
import {feedback} from './feedback';
import {vocabularyLanguage} from './vocabulary';
import {recommendedModalities} from './recommendedModalities';
import {addToFlexBook} from './addToFlexBook';
import {combineReducers} from 'redux';
import {standards} from './standards';
import {addToLibrary} from './addToLibrary';
import {generatePDF} from './generatePDF';
import {annotationList} from './annotationsList';
import {practice} from './practice';
import {groupEditingDetails} from './groupEditingDetails';
import {PDFDownloadInfo} from './PDFDownloadInfo'
export const createReducer = () => {
  return combineReducers({
    location,
    locationInfo,
    flexbookTOC,
    groups,
    userInfo,
    feedback,
    standards,
    currentTOCSection,
    recommendedModalities,
    addToFlexBook,
    vocabularyLanguage,
    addToLibrary,
    generatePDF,
    PDFDownloadInfo,
    annotationList,
    practice,
    groupEditingDetails
  });
};

export default createReducer;
