import { get as GET, post as POST, authGet } from '../services/methods';
import { ajax } from 'ck12-ajax';

const apiServer = '/';

export const getCollection = (collectionHandle,collectionCreatorID)=> GET(`${apiServer}taxonomy/collection/collectionHandle=${collectionHandle}&collectionCreatorID=${collectionCreatorID}?includeRelations=True`,  {useCDN:true, cdnExpirationAge: 'daily', cdnCacheUserInfo: false});
/*
export const getCollectionDescendant = (collectionHandle,collectionCreatorID,descendantIdentifier)=> GET(`${apiServer}taxonomy/collection/collectionHandle=${collectionHandle}&collectionCreatorID=${collectionCreatorID}/descendant/${descendantIdentifier}`);
export const getPublishedCollection = ()=> GET(`${apiServer}taxonomy/collections/published`);
export const deleteCollection = (collectionHandle)=> GET(`${apiServer}taxonomy/collection/delete/${collectionHandle}`);
export const createCollection = ({userdata})=> {
    return POST(`taxonomy/collection/create`, {
        userdata: JSON.stringify(userdata)
    });

};*/
export const getFlexbooks = (collectionHandle)=> GET(`${apiServer}flx/browse/subject/book/${collectionHandle}?ck12only=true&extendedArtifacts=true&filters=false&pageSize=200&sort=stitle,asc`, {useCDN:true, cdnExpirationAge: 'daily', cdnCacheUserInfo: false});
export const getLocation = ()=> GET(`${apiServer}dexter/get/location/ip`, {cdnCache: false});
export const getAuth = ()=> authGet(`${apiServer}auth/get/info/my`)

export default {
    getCollection,
  /*getCollectionDescendant,
    getPublishedCollection,
    deleteCollection,
    createCollection,*/
    getFlexbooks,
    getLocation,
    getAuth
}
