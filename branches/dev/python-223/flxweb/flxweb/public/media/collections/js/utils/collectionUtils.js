export const processCollectionResponse = (responseData) => {
  let out = {};
  if (responseData.collection){
    out.collection = processCollectionItem(responseData.collection);
  }
  return out;
};

export const processCollectionItem = (item) => {
  let newItem = {...item};
  let splitHandle = newItem.handle.split('-::-');
  newItem.contains = newItem.contains || [];
  newItem.contains = newItem.contains.map(processCollectionItem);
  newItem.simpleHandle = (splitHandle[1]?splitHandle[1]:splitHandle[0]).toLowerCase();
  return newItem;
};

export const processFlexbookResponse = (responseData) => {
  return responseData;
};

export const getConceptPageURL = (collectionHandle, collectionNode) => {
  //Constructs URL for non-collection concept page.
  //To be deprecated after concept page starts supporting collections.
  var creatorID = collectionNode.creatorID;
  var creatorIDterm = (creatorID == 3) ? "" : "/user:" + creatorID;
  return `/c${creatorIDterm}/${collectionHandle.toLowerCase()}/${collectionNode.absoluteHandle}`; 
};

export default {
  processCollectionResponse,
  processFlexbookResponse
};
