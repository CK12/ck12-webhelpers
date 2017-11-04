import React from 'react';
import {connect} from 'react-redux';
import FlexBookTitleBlock from '../components/FlexBookTitleBlock.js';
import FlexBookPrevNextTop from './FlexBookPrevNextTop.js';
import PracticeBadge from '../components/PracticeBadge';
import ActionsPanel from '../components/ActionsPanel';
import {
  isBookLoaded,
  getCurrentPosition,
  getCurrentSectionInfo,
  getLevel,
  isSectionDraft,
  showPracticeBadge
} from '../selectors/selectors.js';
import {formatTitle,getCreatorName} from '../utils/utils';

const FlexBookTopTitle = (props) => {

  let {position,title,level,creator,artifactType, isDraft, showBadge} = props;
  title = formatTitle(title);
  creator = getCreatorName(creator);
  return (
    <div
      className='clearfix flexbooktoptitle'
      style={styles}>
      {position=='0.0'?null:
        <FlexBookPrevNextTop pos
          ition={position}/>
      }
      <FlexBookTitleBlock
        isDraft={isDraft}
        position={position}
        level={level}
        title={title}
        creator={creator}
        artifactType={artifactType}
        showPracticeBadge={showBadge}
        />
      <PracticeBadge/>
      <ActionsPanel/>
    </div>
  );
};

const mapStateToProps = (state) => {
  if (isBookLoaded(state)){
    let {loaded, artifact} = getCurrentSectionInfo(state);
    let level = getLevel(state) || 'Basic';
    let isDraft = isSectionDraft(state);
    let showBadge = showPracticeBadge(state);
    if (loaded){
      let position = getCurrentPosition(state);
      let {title, creator, artifactType} = artifact;
      return {
        position,
        title,
        level,
        creator,
        artifactType,
        isDraft,
        showBadge
      };
    }

  }
  return {};
};

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

const styles = {
  marginBottom: 20
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FlexBookTopTitle);
