import React from 'react';
import Modal from 'react-modal';
import {connect} from 'react-redux';
import {addRevisionToLibrary} from '../actions/actions.js';
import {getContentAddedResponse} from '../selectors/selectors.js';
import { getCurrentSectionArtifact } from '../selectors/selectors.js';

class AddToLibrary extends React.Component {
  constructor () {
    super();
    this.state = {
      open: true
    };
  }
  componentDidMount(){
    let {id, artifactRevisionID} = this.props;
    this.props.addRevisionToLibrary({artifactRevisionID, id});
  }
  openModal () {
    this.setState({open: true});
  }
  closeModal () {
    this.setState({open: false});
    this.props.callbackParent(false);
  }

  render() {
    //document.body.style.overflow = 'hidden';
    return (
      <div className='addtolibrary'>
        { this.state.open ?
          <Modal
            contentLabel='AddToLibrary-Modal'
            isOpen={this.state.open}
            onRequestClose={()=>this.closeModal()}
            style={customStyles}>
            <div style={styles.zholder}>
              <div style={styles.header}>
              </div>
              <div
                style={styles.close}
                onClick={()=>this.closeModal()}>+</div>
              <div style={styles.content}>
                This resource has been added to your Library.
              </div>
              <div style={styles.modalActions}>
                <div
                  className="button turquoise"
                  onClick={()=>this.closeModal()}>OK</div>
              </div>
            </div>
          </Modal>
          : null
        }
      </div>
    );
  }
}

const customStyles = {
  overlay : {
    top: '0px',
    bottom: '0px',
    left: '0px',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(204, 204, 204,0.6)',
    zIndex: 11
  },
  content : {
    textAlign: 'center',
    width: '480px',
    color: '#000',
    border: '2px solid #ccc',
    borderRadius: '5px',
    marginTop: '190.5px',
    margin: 'auto',
    maxWidth: '93%',
    maxHeight: '95%',
    minWidth: '270px',
    minHeight: '75px',
    background: '#fff',
    position: 'relative',
    top: '40vh',
    overflow: 'visible',
    left: '0px',
    right: '0px'
  }
};

const styles = {
  mcontainer:{
    display: 'block',
    position: 'fixed',
    cursor: 'pointer',
    background: '#000',
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px',
    bottom: '0px',
    right: '0px',

  },
  zholder:{
    zIndex: '10000',
  },
  header:{
    color: '#56544D',
    fontSize: '1.2em',
    fontWeight:'bold',
    paddingTop:'15px',
  },
  close:{
    background: '#56544D',
    borderRadius: '30px',
    color: '#CEC9BE',
    cursor: 'pointer',
    fontFamily: 'times new roman',
    fontSize: '30px',
    lineHeight: '30px',
    fontWeight: 'normal',
    padding: '0px',
    position: 'absolute',
    right: '-14px',
    top: '-14px',
    width: '30px',
    height: '30px',
    textAlign: 'center',
    textShadow: 'none',
    transform: 'rotate(45deg)'
  },
  content:{
    color: '#8F8E8A',
    lineHeight: '1.5em',
    padding: '15px 0 30px',
    wordWrap: 'break-word'
  },
  modalActions:{
    textAlign: 'center'
  }
};

const mapStateToProps = (state) => {
  let artifact = getCurrentSectionArtifact(state);
  let artifactRevisionID = ( artifact.revisions) ? artifact.revisions[0].id : artifact.revisionID;
  let id = artifact.id;
  let response = getContentAddedResponse(state);
  return{
    artifactRevisionID,
    id,
    response
  };
};

export default connect(
  mapStateToProps,
  {
    addRevisionToLibrary
  }
)(AddToLibrary);
