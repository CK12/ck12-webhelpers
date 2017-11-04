import React, {Component} from 'react';
import Header from './common/Header';
import Button from './common/Button';
import ButtonPair from './common/ButtonPair';
import Clearfix from './common/Clearfix';
import {FEEDBACK_COMMENT_PLACEHOLDER} from '../constants/placeholders';

class CommentBox extends Component{
  render(){
    return (
    <div className='commentbox'>
      <Header weight='normal'>Post a Comment </Header>
      <textarea placeholder={FEEDBACK_COMMENT_PLACEHOLDER} ref={(c)=> {this.comment = c;}}/>
      <Clearfix>
        <ButtonPair position='right'>
          <Button style={styles.post} color='turquoise' handleClick={() => this.handlePost()}>Post</Button>
          <Button color='grey' handleClick={this.props.cancelComment}>Cancel</Button>
        </ButtonPair>
      </Clearfix>
    </div>
    );
  }

  handlePost(){
    let comment = this.comment.value;
    this.props.postComment(comment);
  }
}

const styles = {
  post: {
    marginRight: 10
  }
};

export default CommentBox;
