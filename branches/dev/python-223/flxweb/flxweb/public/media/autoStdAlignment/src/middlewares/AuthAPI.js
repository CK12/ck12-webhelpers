import {ActionTypes, ActionMethods} from '../actions/';

const {
      accessForbiden,
      accessProvided,
      notLoggedIn,
      TriggerRouteChange
    } = ActionMethods;

const authUrl =  'https://'+ location.hostname+ '/flx/get/detail/my';
const STD_ADMIN_ROLE_ID =  25;

const authValidation =  (store, action)=>{
  let request  =  new Request(authUrl, {
    method : 'GET',
    credentials : 'include'
  });

  fetch(request)
      .then(res=>{
        return res.json();
      }).then(json=>{
        if( json.response && json.response.roles ){
          const roles  =  json.response.roles;
          const stdAdminRole  = roles.find(val=>val.id==STD_ADMIN_ROLE_ID);
          if( stdAdminRole){
            store.dispatch(accessProvided());
          }else{
            store.dispatch(accessForbiden());
          }
        }else{
          store.dispatch(notLoggedIn());
        }
      }).catch(e=>{
        store.dispatch(accessForbiden());
      });

};

const openSignInPage = ( store, action )=>{
  document.querySelector('#top_nav_signin').click();
};

export default store =>  next => action => {
  next(action);

  switch ( action.type ){
  case ActionTypes.APP_INIT :
    authValidation( store, action);
    break;
  case ActionTypes.SIGN_IN_PAGE_DO_SIGN_IN :
    openSignInPage( store, action);
    break;
  }

};
