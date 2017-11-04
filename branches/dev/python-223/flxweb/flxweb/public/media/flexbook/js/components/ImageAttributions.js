import React from 'react';
import Radium from 'radium';
import ImageAttribution from './ImageAttribution';
import Header from './common/Header';
import Separator from './common/Separator';
import isEmpty from 'lodash/isEmpty';

const ImageAttributions = ({attributions = []}) => {
  let attributionComponents = attributions.map((attribution, index)=> <ImageAttribution key={`img-attr-${index}`} index={index+1} {...attribution}/>);
  if(isEmpty(attributionComponents))
    return null;
  return (
    <div style={styles.wordWrap} className='imageattributions'>
      <Separator/>
      <Header weight='regular' size='header3'> Image Attributions </Header>
      {attributionComponents}
    </div>
  );
};

const styles = {
  wordWrap: {
    '@media screen and (max-width:767px)':{
      wordWrap: 'break-word'
    }
  }
}

ImageAttributions.propTypes = {
  attributions: React.PropTypes.array
};

export default Radium(ImageAttributions);
