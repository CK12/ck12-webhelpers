import React, {Component} from 'react';
import Link from './common/Link';
import Popup from './common/Popup';
import ConfirmationModal from './ConfirmationModal';

class AbusePopup extends Component{
  constructor(){
    super();
    this.state = {
      isOpen: true,
      isModalOpen: false
    };
  }
  handleFlag(){
    this.setState({
      isOpen: false,
      isModalOpen: true
    });
    this.props.closePopup();
  }

  render(){
    if(this.state.isOpen)
      return (
      <Popup
        style={styles.container}
        className='abuse-popup'>
        <span>Does this post seem offensive or disrespectful?</span>
        <span onClick={()=> this.handleFlag()}>
          <Link style={styles.link}> Flag it as inappropriate </Link>
        </span>
      </Popup>
      );
    else if(this.state.isModalOpen)
      return <ConfirmationModal
                title = 'Report Abused'
                message='report this comment as abused'
                action={this.props.reportComment}/>;
    return <div/>;
  }
}



const styles = {
  container: {
    border: '2px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    maxWidth: '216px',
    minWidth: '100px',
    padding: '10px',
    position: 'absolute',
    zIndex: 10,
    height: 'auto'
  },
  link: {
    display: 'inline-block',
    marginTop: '20px'
  }
};


export default AbusePopup;
