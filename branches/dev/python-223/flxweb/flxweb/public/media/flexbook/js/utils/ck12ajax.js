import request from 'superagent-bluebird-promise';
import {Promise} from 'bluebird';


const requestMethods = {
  get(url) { return request.get(url); },
  post(url) { return request.post(url); },
  put(url) { return request.put(url); },
  delete(url) { return request.delete(url); },
  head(url) { return request.head(url); }
};

const processCK12Response = (responseObj, responseType) => {
  let {body, text} = responseObj;
  if ( (responseType === 'json')) {
    if (!body) {
      body = JSON.parse(text);
    }
    let { response, responseHeader } = body;
    if (responseHeader.status === 0){
      if (response){
        return response;
      } else {
        throw new Error('"response" key is not available in the api response');
      }
    } else {
      throw new Error(response.message || 'unknown error');
    }
  } else if (text) {
    return text;
  } else {
    throw new Error('invalid response');
  }
};

export const ajax = (options) => {
  return new Promise( (resolve) => {
    let {url, method, data, contentType} = options;
    if ('string' == typeof options){
      url = options;
    }
    if (!method) { method = 'get';}
    let ajaxfn = requestMethods[method];
    let query = {};

    if (ajaxfn && 'function' === typeof(ajaxfn)){
      if (!contentType) {contentType = 'form';}

      if (data) {
        if (method === 'get'){
          query = {
            ...data
          };
          data = {};
        }
      } else {
        data = {};
      }
      let resolution =  ajaxfn(url)
      .type(contentType)
      .query(query)
      .send(data);
      resolve(resolution);
    } else {
      throw new Error('Invalid http method: ' + method);
    }
  });

};

export const ck12ajax = (options) => {
  let {responseType} = options;
  if (!responseType) {responseType = 'json';}
  return ajax(options).then((res) => {
    return processCK12Response(res, responseType);
  });
};
