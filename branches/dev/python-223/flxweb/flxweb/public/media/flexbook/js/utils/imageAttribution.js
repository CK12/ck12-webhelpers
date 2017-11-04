const REGEX_ATTRIB_CONTAINERS = /<(div|span) .*?class="x-ck12-img.*?">([\s\S]+?)<\/(div|span)>/gm;
const REGEX_ATTRIBUTION_COMMENT = /<!-- @@(\w+)="(.*?)" -->/g;
const REGEX_IMAGE_ELEMENT = /<img\s?(data-flx-url="(.*?)")? src="(.*?)".*?\/?>/;

export const isNonCK12EditorImage = (url) => {
  if (!url){
    url = '';
  }
  url = '' + url;

  if(url.indexOf('user%3A')!== -1){
    if (url.indexOf('ck12editor') !== -1){
      return false;
    }
    return true;
  }
  return false;
};

export const extractImageAttributions = (xhtml) => {
  let out = [];
  let match = REGEX_ATTRIB_CONTAINERS.exec(xhtml);
  let imgBlock = '';
  let match_comments, match_image, attribObj;
  while (match) {
    attribObj = {};
    imgBlock = match[2];
    match_comments = REGEX_ATTRIBUTION_COMMENT.exec(imgBlock);
    while(match_comments){
      attribObj[match_comments[1]] = match_comments[2];
      match_comments = REGEX_ATTRIBUTION_COMMENT.exec(imgBlock);

    }
    match_image = REGEX_IMAGE_ELEMENT.exec(imgBlock);
    if (match_image){
      attribObj['flxURL'] = match_image[2] || '';
      attribObj['src'] = match_image[3] || '';
    }

    if ( isNonCK12EditorImage(attribObj.flxURL) || isNonCK12EditorImage(attribObj.src) ){
      out.push(attribObj);
    }
    match = REGEX_ATTRIB_CONTAINERS.exec(xhtml);
  }
  return out;
};
