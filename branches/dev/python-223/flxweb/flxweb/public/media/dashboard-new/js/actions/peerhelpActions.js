import { peerhelpService } from 'services';

import {
    FETCH_QA_COUNTS_SUCCESS,
    FETCH_QA_COUNTS_ERROR
} from 'actions/actionTypes';

export function fetchQACounts(groupID, dispatch){
    return peerhelpService.getQACounts(groupID)
        .then(counts =>
            dispatch({ type: FETCH_QA_COUNTS_SUCCESS, counts, groupID })
        )
        .catch(() =>
            dispatch({ type: FETCH_QA_COUNTS_ERROR })
        );
}