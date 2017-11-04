import { get as GET, post as POST, authGet, authPost } from 'services/methods';

export const getDetail     = () => authGet(`https://${location.host}/auth/get/detail/my`);

export const updateMember = (memberID, data) => authPost(`https://${location.host}/auth/update/member/${memberID}`, data);

export const getUserSubjects    = () => GET('/flx/get/member/subjects');
export const updateUserSubjects = (data) => POST('/flx/set/member/subjects', data);

export const getUserGrades    = () => GET('/flx/get/member/grades');
export const updateUserGrades = (data) => POST('/flx/set/member/grades', data);

export const updateUserImage = (data) => authPost(`https://${location.host}/auth/save/profile/image`, data);


export default {
    getDetail,

    updateMember,

    getUserSubjects,
    updateUserSubjects,

    getUserGrades,
    updateUserGrades,

    updateUserImage
};