import React from 'react';
import Review from './Review';
import Header from './common/Header';
import Link from './common/Link';
import Icon from './common/Icon';
import Radium from 'radium';
import Separator from '../components/common/Separator';

class Reviews extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      open: false
    };
  }

  handleClick(){
    let {open} = this.state;
    this.setState({open: !open});
  }

  render(){
    let {reviews: {reviewsList}} = this.props,
      numReviews = reviewsList.length,
      Reviews = reviewsList.map((review, index) => {
        return <Review key={`rev${index}`} {...review}/>;
      });

    let ReviewsMarkup =  (
      <div className='reviews' style={styles.container}>
        <Separator size='mini'/>
        <div style={styles.header}>
          <Header size='header4'>Most Helpful Reviews: </Header>
          <Link
            style={styles.close}
            onClick={()=>this.handleClick()}> Close </Link>
        </div>
        {Reviews}
      </div>
    );
    let showReviewsMarkup = (
      <div style={styles.container}>
        <Link onClick={()=>this.handleClick()}>
          <span>
            {`Show reviews (${numReviews}) `}
          </span>
          <Icon name='arrow3-down'/>
        </Link>
        <Separator size='mini'/>
      </div>
    );
    if(numReviews > 0){
      if(this.state.open)
        return ReviewsMarkup;
      else
      return showReviewsMarkup;
    }
    return null;
  }
}



const styles = {
  close: {
    float: 'right',
  },
  header: {
    marginBottom: 26
  },
  container: {
    zoom: 1,
    width: '100%',
    overflow: 'auto',
    marginTop: '10px'
  }
};

export default Radium(Reviews);
