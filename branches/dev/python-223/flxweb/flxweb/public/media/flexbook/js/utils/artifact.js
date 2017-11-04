const REGEX_BODY = /<body>([\s\S]+)<\/body>/;
const REGEX_CONTENT_BLOCKS = /<div class="x-ck12-data-(objectives|vocabulary|problem-set)+">([\s\S]*?)<\/div>/g;
const REGEX_CONCEPT_COMMENT = /<!-- (Begin|End) inserted XHTML \[CONCEPT: \d+\] -->/g;
const REGEX_CONCEPT_CONTENT = /<div class="x-ck12-data-concept">([\s\S]+)<\/div>/;

export const processSectionContent = (content) => {
  let contentMatch = REGEX_BODY.exec(content);
  let processedContent = {
    objectives: '',
    conceptContent: '',
    vocabulary: ''
  };
  if (contentMatch){
    let contentBody = contentMatch[1];
    let contentBlocksSearch = REGEX_CONTENT_BLOCKS.exec(contentBody);
    while (contentBlocksSearch){
      let blockName = contentBlocksSearch[1];
      if (blockName === 'objectives' || blockName === 'vocabulary'){
        processedContent[blockName] = contentBlocksSearch[2].trim();
      }
      contentBlocksSearch = REGEX_CONTENT_BLOCKS.exec(contentBody);
    }

    processedContent.conceptContent = contentBody
    .replace(REGEX_CONTENT_BLOCKS,'')
    .replace(REGEX_CONCEPT_COMMENT,'')
    .replace(REGEX_CONCEPT_CONTENT, '$1')
    .trim();


    return processedContent;
  }
  return {
    objectives: '',
    conceptContent: content,
    vocabulary: ''
  };
};

export const createBookAssemblePayload = (artifact) => {
  console.log(artifact);
  let {
    type,
    title,
    id:artifactID,
    revisions:[{children, id:artifactRevisionID}]
  } = artifact;

  children = children.map( (child) => createChapterAssemblePayload(child) );
  let assemblePayload = {
    title,
    type,
    id: artifactID,
    revisonID: artifactRevisionID,
    children
  };
  console.log(assemblePayload);
  return assemblePayload;
};

export const createChapterAssemblePayload = (chapter) => {
  let {
    id:artifactID,
    revisionID:artifactRevisionID,
    type:artifactType
  } = chapter;
  let children = [];

  if ('string' !== typeof artifactType){
    ( {name:artifactType} = artifactType );
  }
  if (artifactType === 'chapter'){
    if (chapter.revisions && chapter.revisions.length === 1){
      let {revisions:[rev]} = chapter;
      children = rev.children || [];
    } else {
      children = chapter.children || [];
    }
  }

  let chapterAssemblePayload  = {
    id: artifactID,
    revisionID: artifactRevisionID
  };
  return chapterAssemblePayload;
};

export const addChapterToFlexBook = (chapter, flexbook) => {
  let chapterAssemblePayload = createChapterAssemblePayload(chapter);
  let children = [ ...flexbook.children, chapterAssemblePayload ];
  return {
    ...flexbook,
    children
  };
};


export const addModalityToFlexBook = (modality, flexbook) => {
  let {revisionID} = modality;
  let children = [ ...flexbook.children, revisionID ];
  return {
    ...flexbook,
    children
  };
};

export const createEmptyBookPayload = ({title}) => {
  return {
    title,
    type:{
      name:'book'
    },
    revisions:[{
      children:[]
    }]
  };
};



export const addArtifactToFlexBook = (artifactToAdd, flexbook) => {
  let { type:{name:artifactType} } = artifactToAdd, modifiedFlexBook;
  flexbook = createBookAssemblePayload(flexbook);
  switch (artifactType) {
  case 'book':{
    let {revisions:[{children}]} = artifactToAdd;
    console.log(children);
    modifiedFlexBook = {...flexbook};
    if (!children){
      children = [];
    }
    children.forEach((child)=>{
      modifiedFlexBook = addChapterToFlexBook(child, modifiedFlexBook);
    });
    break;
  }
  case 'chapter':
  default:
    modifiedFlexBook = addChapterToFlexBook(artifactToAdd, flexbook);
    break;
  }
  let {children} = modifiedFlexBook;
  modifiedFlexBook = {...modifiedFlexBook, revisions:[{children}]};
  return modifiedFlexBook;
};
window.addArtifactToFlexBook = addArtifactToFlexBook;
