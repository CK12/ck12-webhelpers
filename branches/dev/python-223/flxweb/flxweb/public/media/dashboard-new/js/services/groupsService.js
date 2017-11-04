import { get, post } from 'services/methods';

import {isArray} from 'lodash';

const CACHE = {
    localCache: {
        region: 'monthly'
    }
};

export const getGroups = (pageNum=1) => get(`/flx/group/my?sort=d_latestGroupActivity&pageSize=10&pageNum=${pageNum}`);
export const getGroupsWithFilter = (filter) => get(`/flx/group/my?${filter}`);
export const createGroup = (data) => post('/flx/create/group?', data);

export const getThemeImages = () => get('/flx/get/info/resources/group%20system%20image?publishedOnly=true', CACHE);

export const getGroupAssignments = (groupID) => get(`/flx/get/my/group/assignments/${groupID}?pageSize=10&sort=due,asc`);

export const getGroupActivity = (groupID) => {
    const filters = encodeURIComponent('includeViewed,false');
    return get(`/flx/group/activity?groupID=${groupID}&filters=${filters}`);
};

export const getGroupSharedActivity = (groupID) => {
    const filters = encodeURIComponent('includeViewed,true;activityType,share');
    return get(`/flx/group/activity?groupID=${groupID}&filters=${filters}`);
};

export const markActivityViewed = (activityIDs) => {
    if(isArray(activityIDs)){
        activityIDs = encodeURIComponent(activityIDs.join(','));
    }
    return post(`/flx/update/activity/status/${activityIDs}`);
};
export const joinGroup = ({accessCode}) => get(`/flx/group/add/member?accessCode=${accessCode}`, {forceHttps: true});
export default {
    getGroups,
    getGroupsWithFilter,
    createGroup,
    getGroupAssignments,
    getGroupActivity,
    getGroupSharedActivity,
    markActivityViewed,
    joinGroup
};
