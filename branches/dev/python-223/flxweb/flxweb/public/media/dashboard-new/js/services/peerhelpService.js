import { get } from 'services/methods';

export const getQACounts = (groupID)=> get(`/peerhelp/api/get/posts?clientID=24839961&filters={%22groupIDs%22:[${groupID}]}&countOnly=true`);

export default {
    getQACounts
};