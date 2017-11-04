import ck12ajax, {ck12AuthAjax} from 'ck12-ajax';

export const get = (url, args = {}) => {
    return ck12ajax({url, ...args});
};

export const authGet = (url, args = {}) => {
    return ck12AuthAjax({url, ...args});
};

export const post = (url, data) => {
    return ck12ajax({
        url,
        data,
        method: 'post'
    });
};

export const authPost = (url, data) => {
    return ck12AuthAjax({
        url,
        data,
        method: 'post'
    });
};