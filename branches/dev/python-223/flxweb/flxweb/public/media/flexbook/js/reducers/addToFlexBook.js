import {
  BOOKS_LIST_FETCH_SUCCESS,
  BOOKS_LIST_FETCH_ERROR,
  BOOKS_LIST_FETCH_START,
  ADDTOFLEXBOOK_START,
  ADDTOFLEXBOOK_SUCCESS,
  ADDTOFLEXBOOK_ERROR
} from '../actions/actionTypes';
import {uniqueElement} from '../utils/utils';
export const addToFlexBook = (state = {
  booksList: [],
  loading: false,
  loadedBooks: 0,
  totalBooks: 0,
  error: false,
  errorInfo : ''
}, action) => {
  if ( action.type === BOOKS_LIST_FETCH_SUCCESS ){
    let {books} = action.payload;
    let totalBooks = action.payload.total;
    let booksList = uniqueElement([...state.booksList, ...books]);
    let loading = false;
    state = {
      ...state,
      totalBooks,
      booksList,
      loading,
      error:false
    };
  }

  if (action.type === BOOKS_LIST_FETCH_START){
    state = {
      ...state,
      loading: true,
      error:false,
      flexbook:[]
    };
  }

  if (action.type === BOOKS_LIST_FETCH_ERROR){
    state = {
      ...state,
      loading: false,
      error: true,
      errorInfo: action.payload.error
    };
  }

  if (action.type === ADDTOFLEXBOOK_START){
    state = {
      ...state,
      addingBook: true,
      error:false,
      flexbook:action.payload.flexbook
    };
  }

  if (action.type === ADDTOFLEXBOOK_SUCCESS){
    let {artifact} = action.payload;
    let flexbook = {artifact};
    let booksList = {...state.booksList, flexbook};
    state = {
      ...state,
      addingBook: false,
      error:false,
      flexbook,
      booksList
    };
  }

  if (action.type === ADDTOFLEXBOOK_ERROR){
    state = {
      ...state,
      addingBook: false,
      error:true,
      errorInfo:action.payload.errorInfo
    };
  }

  return state;
};
