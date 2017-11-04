import React, {Component} from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import {getSummaries, getCurrentSectionArtifact} from '../selectors/selectors';

class SummaryView extends Component {
  constructor(){
    super();
    this.state = {
      open: true
    };
  }
  openModal () {
    this.setState({open: true});
  }
  closeModal () {
    this.setState({open: false});
    this.props.callbackParent(false);
  }
  render(){
    let {summaries, title} = this.props;
    let summaryLink = summaries.map(function(summary, index){
      return <li key={index} style={styles.summary}>{summary}</li>
    })
    return(
      this.state.open &&
      <Modal contentLabel='SummaryModal' style={modalStyles} isOpen={this.state.open}>
        <div style={styles.close} onClick={()=>this.closeModal()}>+</div>
        <div style={styles.title}>
          Summary: {title}
        </div>
        <div style={styles.summaryContainer}>{summaryLink}</div>
      </Modal>
    )
  }
}

const modalStyles = {
  overlay : {
    top: '0px',
    bottom: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255,0.45)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  content : {
    position: 'relative',
    top: '0px',
    left: '0px',
    bottom: '0px',
    overflow: 'visible',
    outline: '0px',
    display: 'block',
    height: 'auto',
    width: '800px',
    border: '1px solid #aaaaaa',
    color: '#222222',
    borderRadius: '5px',
    fontSize: '1.1em',
    padding: '0px',
    margin: '0px auto',
    backgroundColor: '#f9f9f5',
    boxShadow: '0 0 20px rgba(0,0,0,.5)'
  }
};

const styles={
  close: {
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
  title:{
    color: '#56544D',
    fontSize: '18px',
    fontFamily: 'ProximaNova',
    fontWeight: 'bold',
    marginLeft: '20px',
    paddingTop: '35px'
  },
  summary:{
    paddingBottom: '10px'
  },
  summaryContainer:{
    fontSize: '14px',
    padding: '40px 40px 10px'
  }
};

const mapStateToProps = (state) => {
  let summaries = getSummaries(state),
  artifact = getCurrentSectionArtifact(state),
  {title} = artifact;
  return {
    summaries,
    title
  }
}

export default connect(
  mapStateToProps,
  null
)(SummaryView);
