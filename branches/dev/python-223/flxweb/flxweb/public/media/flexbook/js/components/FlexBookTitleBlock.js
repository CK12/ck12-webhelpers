import React from 'react';
import Radium from 'radium';

const renderTitle = (title, position, isDraft) => {
  if (position === '0.0') {
    return (
      <h1 style={styles.title}>
        {title}
      </h1>
    );
  } else {
    return (
      <h1 style={styles.title}>
        <span>
          {position}
        </span>
        {' '}
        <span>
          {title}
        </span>
        {isDraft && <span style={styles.draft} id="draft-label" className="draft-label-details">DRAFT</span>}
      </h1>
    );
  }
};

const FlexBookTitleBlock = (props) => {
  let {title, position, level, creator, isDraft, showPracticeBadge} = props,
  newStyles = styles.container;
  if(showPracticeBadge)
  {
    newStyles = Object.assign({},styles.container, styles.maxWidth);
  }
  return (
    <div
      style={newStyles}
      className='flexbooktitleblock'>
      <div>
        {renderTitle(title, position, isDraft)}
      </div>
      <div>
        <span>
          <span>Difficulty Level: </span>
          <strong style={styles.level}>
            {level}
          </strong>
        </span>
        { ' | ' }
        <span>
          <span>Created by: </span>
          <span>
            {creator}
          </span>
        </span>
      </div>
    </div>
  );
};

FlexBookTitleBlock.propTypes = {
  title: React.PropTypes.string,
  position: React.PropTypes.string,
  level: React.PropTypes.string,
  creator: React.PropTypes.string
};

const styles = {
  draft: {
    height: '25px',
    left: '10px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #95e3ff',
    color: '#95e3ff',
    fontSize: '17px',
    lineHeight: '22px',
    padding: '3px 5px 0px 4px',
    position: 'relative',
    textAlign: 'center'
  },
  container: {
    float: 'left',
    '@media screen and (max-width:767px)':{
      width:'100%'
    }
  },
  title:{
    fontSize: 24,
    margin: 0
  },
  maxWidth: {
    '@media screen and (min-width:768px)':{
      maxWidth: 'calc(100% - 320px)'
    }
  },
  level: {
    textTransform: 'capitalize'
  }
};

export default Radium(FlexBookTitleBlock);
