import { get } from 'services/methods';
import { ajax } from 'ck12-ajax';

export const fetchStandards = () => ajax('/media/js/models/standards.json');
export const getBooksData = ({subjectName,countryCode,standard,standardId,grade}) => ajax(`/ajax/standards/books/${subjectName}/${countryCode}.${standard}/${grade}/${countryCode}.${standard}/${standardId}/${standard}/`);
export const getStandardsCorrelationsData = ({url}) => ajax(url);
export const fetchModalities = ({modalityTypes,branches}) => get(`/flx/analytics/get/trending/modalities?ck12Only=true&modality_types=${modalityTypes}&collectionHandles=${branches}&pageSize=5`);
export const fetchRecentlyViewedModalities = ({modalityTypes,collectionHandles}) => get(`/flx/analytics/member/last-read-modalities?modalityTypes=${modalityTypes}&details=true&isModality=true&withEID=true&collectionHandles=${collectionHandles}&pageSize=5`);
export const placeInLibrary = ({objectID,objectType}) => get(`/flx/add/mylib/object?objectID=${objectID}&objectType=${objectType}`);
export const checkInLibrary = ({artifactID,artifactRevision}) => get(`/flx/check/mylib/objects?parentIDs=${artifactID}&objectTypes=${artifactRevision}`);

export default {
    fetchStandards,
    getBooksData,
    fetchRecentlyViewedModalities,
    getStandardsCorrelationsData,
    fetchModalities,
    placeInLibrary,
    checkInLibrary
};
