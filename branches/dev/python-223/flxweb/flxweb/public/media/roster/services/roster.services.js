import {ck12ajax, ck12AuthAjax} from 'ck12-ajax';
import Promise from 'bluebird';

export const getMyStudents = (data) =>{
    let url = '/flx/get/my/students';
    return ck12ajax({
        url: url,
        data: data,
        method: 'get'
    });
};

export const createAccount = (data)=>{
    let url = `//${window.location.hostname}/auth/create/student`;
    return new Promise((resolve)=>{
        ck12AuthAjax({
            url: url,
            data: data,
            method: 'post'
        }).then((data)=>{
            data.responseHeader = {
                status: 0
            };
            resolve(data);
        }).catch((data)=>{
            resolve(data);
        });
    });
};
export const checkUsername = (data)=>{
    let url =  `//${window.location.hostname}/auth/check/loginUsed`;
    return ck12AuthAjax({
        url: url,
        data: data,
        method: 'get'
    });
};

export const addStudentToGroup = (data)=>{
    let url = '/flx/group/add/member';
    return new Promise((resolve)=>{
        ck12ajax({
            url: url,
            data: data,
            method: 'post'
        }).then((data)=>{
            data.responseHeader = {
                status: 0
            };
            resolve(data);
        }).catch((data)=>{
            resolve(data);
        });
    });
};
