import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {getCurrentSectionArtifact, isCustomFlexBook} from '../selectors/selectors';
import {formatTitle} from '../utils/utils';
import {FILE_NOT_FOUND} from '../constants/errors';

const FlexBookSEOMeta = (props) => {
  let {title,description, isCustom, tagTerms} = props,
  meta=[
    {"name": "description", "content": description}
  ];
  isCustom && meta.push({"name": "robots", "content": "noindex"});
  for(let i=0;i<tagTerms.length;i++)
  {
    meta.push({"itemprop": "keywords", "content": tagTerms[i]});
  }
  
  return (
    <Helmet
      title = {title || FILE_NOT_FOUND}
      titleTemplate="%s | CK-12 Foundation"
      meta={meta}
    />
  );
};

const mapStateToProps = (state) => {
  let {title, description, tagTerms=[]} = getCurrentSectionArtifact(state),
  isCustom = isCustomFlexBook(state);
  tagTerms = tagTerms.map((tagTerm)=>tagTerm.name);
  return {
    title: formatTitle(title),
    description,
    tagTerms,
    isCustom
  };
};


const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(FlexBookSEOMeta);
