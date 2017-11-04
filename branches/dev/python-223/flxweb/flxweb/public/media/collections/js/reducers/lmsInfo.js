export const lmsInfo = (state = {
  lmsContext: false,
  lmsType:null
}, action) => {
  if (action.type === 'LTI_CONTEXT_DETECTED'){
    let newState = {
      lmsContext:true,
      lmsType:'lti'
    };
    return newState;
  }
  return state;
};
