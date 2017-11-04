import React from 'react';
import TOCRow from './TOCRow.js';
import Separator from './common/Separator';
import {TABLE_OF_CONTENTS} from '../constants/constants';

class FlexBookTOC extends React.Component {
  constructor(){
    super();
    this.onSectionClick = this.onSectionClick.bind(this);
  }

  onSectionClick(section){
    if (this.props.onSectionClick){
      this.props.onSectionClick(section);
    }
  }

  render(){
    let {chapters = [], bookInfo, messageToUsers} = this.props;
    let {realm, handle, artifactType, revision} = bookInfo;
    let chapterIndex = 1;
    let renderedChapters = chapters.map((chapter) => {
      let {id:artifactID, title, description:summary, hasDraft} = chapter;
      let position = chapterIndex + '.0';
      chapterIndex += 1;
      let rowInfo = {realm, handle, artifactType, revision, position, title, summary, hasDraft};
      return (
        <TOCRow
          key={'ch_' + artifactID}
          onRowClick={this.onSectionClick}
          {...rowInfo}  />
      );
    });
    return (
      <div className='flexbooktoc'>
        <Separator className="hr-hide-for-small"/>
        <div style={styles.tocHeader}>
          {TABLE_OF_CONTENTS}
        </div>
        <div style={styles.message}>
          {messageToUsers}
        </div>
        <div>
          {renderedChapters}
        </div>
      </div>
    );
  }
}

const styles = {
  tocHeader: {
    fontSize: '1.5em',
    fontWeight: 'bold'
  },
  message: {
    paddingTop: 10,
    paddingBottom: 10
  }
};

export default FlexBookTOC;
