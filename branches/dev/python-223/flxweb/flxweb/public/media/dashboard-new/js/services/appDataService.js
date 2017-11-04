import { get as GET, post as POST } from 'services/methods';

const APP_NAME = 'teacher_dashboard';

export const getAppData = ()=> GET(`/flx/get/appdata/${APP_NAME}`);
export const saveAppData = ({userdata})=> {
    return POST(`/flx/save/appdata/${APP_NAME}`, {
        userdata: JSON.stringify(userdata)
    });

};

export default {
    get: getAppData,
    save: saveAppData
};