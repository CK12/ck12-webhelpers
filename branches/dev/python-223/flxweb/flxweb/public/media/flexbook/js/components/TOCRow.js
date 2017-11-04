import React from 'react';
import FlexBookLink from './FlexBookLink.js';
import {formatHandle} from '../utils/utils';

export default class TOCRow extends React.Component {
  constructor(){
    super();
    this.onRowClick = this.onRowClick.bind(this);
  }

  onRowClick(section){
    if(this.props.onRowClick){
      this.props.onRowClick(section);
    }
  }

  render(){
    let {
      realm,
      handle,
      artifactType,
      revision,
      position,
      summary,
      title,
      hasDraft
    } = this.props;
    let section = position;
    let linkInfo = {realm,handle,artifactType,revision,section};
    return (
      <h2 style={styles.chapterRow}>
        <div className='tocrow'>
          <FlexBookLink
            {...linkInfo}
            onClick={this.onRowClick} >
            <span>
              {position}
            </span>
            { ' ' }
            <span>
              {formatHandle(title)}
              {hasDraft && <span style={styles.draft} id="draft-label" className="draft-label-details">DRAFT</span>}
            </span>
          </FlexBookLink>
          <div>
            {summary}
          </div>
        </div>
      </h2>
    );
  }
}

const styles = {
  chapterRow: {
    marginTop: '20px',
    fontSize: '1em',
    fontWeight: 'normal'
  },
  draft: {
    height: '25px',
    left: '10px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #95e3ff',
    color: '#95e3ff',
    fontSize: '12px',
    lineHeight: '22px',
    padding: '2px 5px 0px 4px',
    position: 'relative',
    textAlign: 'center'
  }
};
