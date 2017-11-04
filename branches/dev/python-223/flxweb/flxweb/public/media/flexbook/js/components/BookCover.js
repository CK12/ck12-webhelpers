import React from 'react';
import {ATBIMAGEICON} from '../constants/constants';

const BookCover = (props) => {
  let renderBook;
  let coverImage;
  let title = props.coverImage?props.title:'';
  if(props.artifactType == 'lesson' || props.artifactType == 'section'){
    coverImage = props.coverImage?props.coverImage:'';
    renderBook =
    <figure
      style={styles.lessonStyle}
      className="hide-for-small">
      <div className="cover" style={styles.cover}>
        <img src={coverImage} title={title} style={styles.img}/>
      </div>
    </figure>
    ;
  }else{
    coverImage = props.coverImage?props.coverImage:ATBIMAGEICON;
    renderBook =
    (<figure className="book">
      <ul>
        <li className="front">
          <div className="cover">
            <img
              src={coverImage}
              title={title}
              alt={title}
            />
          </div>
          <span className="shadow">
          </span>
        </li>
        <li className="pages">
          <div className="thin page1">
          </div>
          <div className="thin page2">
          </div>
          <div className="thin page3">
          </div>
        </li>
        <li className="back">
        </li>
        <span className="shadow">
        </span>
      </ul>
    </figure>
  );
  }
  return (
    <span className='books'>
      {renderBook}
    </span>
  );
};

const styles = {
  lessonStyle:{
    position: 'relative',
    margin: '0px 1px 1px',
    textAlign: 'right',
  },
  cover:{
    width: '100%',
    height: '93px'
  },
  img:{
    position: 'relative',
    transform: 'translateY(-50%)',
    top: '50%',
    boxShadow: '2px 2px 3px 0 #ccc',
    maxHeight: '150%',
    minWidth: '100%'
  }

};

export default BookCover;
