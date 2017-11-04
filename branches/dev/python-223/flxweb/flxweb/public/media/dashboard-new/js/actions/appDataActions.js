import { get, merge } from 'lodash';
import { appDataService } from 'services';

import {
    SAVE_APP_DATA_SUCCESS,
    SAVE_APP_DATA_ERROR,

    FETCH_APP_DATA_SUCCESS,
    FETCH_APP_DATA_ERROR
} from 'actions/actionTypes';

export function fetchAppData(dispatch){
    return appDataService.get()
        .then(({userdata={}}) =>
            dispatch({ type: FETCH_APP_DATA_SUCCESS, userdata })
        )
        .catch(() =>
            dispatch({ type: FETCH_APP_DATA_ERROR })
        );
}

export function saveAppData(dispatch, appData, data){
    if(!appData){ return console.error('Current appData must be sent when updating'); }
    if(!get(data, 'userdata', false)){ data = { userdata: data }; }

    const userData = merge({}, appData, data);

    return appDataService.save(userData)
        .then(({userdata}) =>
            dispatch({ type: SAVE_APP_DATA_SUCCESS, userdata })
        )
        .catch(() =>
            dispatch({ type: SAVE_APP_DATA_ERROR })
        );
}