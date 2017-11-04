import { userService } from 'services';

import {
    GET_USER,
    SET_USER,
    FETCH_USER_SUCCESS,
    FETCH_USER_ERROR,
    UPDATE_USER_IMAGE_SUCCESS,
    UPDATE_USER_IMAGE_ERROR
} from 'actions/actionTypes';

export function getUser() {
    return { type: GET_USER  };
}

export function setUser(user){
    return {
        type: SET_USER,
        user
    };
}

export function fetchUser(dispatch){
    return userService.getDetail()
        .then(user =>
            dispatch({ type: FETCH_USER_SUCCESS, user })
        )
        .catch(() =>
            dispatch({ type: FETCH_USER_ERROR })
        );
}

export function updateUserImage(data, dispatch){
    return userService.updateUserImage(data)
        .then(images =>
            dispatch({
                type: UPDATE_USER_IMAGE_SUCCESS,
                imageURL: images.uri
            })
        )
        .catch(() =>
            dispatch({ type: UPDATE_USER_IMAGE_ERROR })
        );
}

