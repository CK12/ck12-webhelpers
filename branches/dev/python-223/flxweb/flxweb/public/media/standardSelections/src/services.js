import ck12ajax, {ck12AuthAjax} from 'ck12-ajax';
import standardsData from '../data/standardsData';

export const loadData = () =>{
    return standardsData;
};

export const fetchCurrentLocation = () =>{
    let url = 'https://' + window.location.host + '/auth/get/info/my';
    return ck12AuthAjax({
        url: url
        // forceHttps: true,
        // withCredentials: true
    });
};
export const fetchCurrentLocation2 = () =>{
    let url = '/dexter/get/location/ip';
    return ck12ajax({
        url: url
    });
};
export const fetchRecentStandards = () =>{
    let url = '/flx/analytics/member/last-read-standards';
    return ck12ajax({
        url: url
    });
};

export const getLoggedInUser = () => {
    let url = '/flx/get/info/my';
    return ck12ajax({url});
};
