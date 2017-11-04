export default (arr=[])=>{
  let obj =  {};
  if( Array.isArray(arr)){
    arr.forEach(val=>obj[val]=val);
  }else{
    throw new Error('Not Handled : KeyMirror expects paramter to be an array');
  }
  return obj;
};
