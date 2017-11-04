import { countsService } from 'services';

import {
    GET_COUNTS,
    INCREMENT_COUNT,
    FETCH_COUNTS_SUCCESS,
    FETCH_COUNTS_ERROR
} from 'actions/actionTypes';

export function getCounts() {
    return { type: GET_COUNTS  };
}

export function incrementCount(countType, amount=1){
    return {
        type: INCREMENT_COUNT,
        countType,
        amount
    };
}

export function fetchCounts(dispatch){
    countsService.getCounts()
        .then(counts =>
            dispatch({ type: FETCH_COUNTS_SUCCESS, counts })
        )
        .catch( ()=>
            dispatch({ type: FETCH_COUNTS_ERROR })
        );
}

