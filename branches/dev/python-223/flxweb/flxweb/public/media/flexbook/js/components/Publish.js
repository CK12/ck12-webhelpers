import React from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import Header from './common/Header';
import Button from './common/Button';
import Separator from './common/Separator';
import CustomRadio from './common/CustomRadio';
import CloseModal from './common/CloseModal';
import {  getSectionTitle, 
          getCurrentSectionArtifact, 
          isArtifactPublished, 
          getCurrentArtifactRevisionID
       } from '../selectors/selectors';
import {publish} from '../actions/actions';
import {Row, Column} from 'react-foundation';
import {LOADINGICON} from '../constants/constants';
import MessageModal from '../components/MessageModal';

class Publish extends React.Component {
  constructor(){
    super();
    this.state = {
      error:false,
      publishing: false
    }
  }

  getMessageModalInfo(){
    let {title: artifactTitle, isPublished} = this.props,
    {publishing} = this.state,
    content, title="CK-12 FlexBook® Textbook",loading=true;
    if(isPublished)
    {
      title="FlexBook® Textbook Published";
      loading = false,
      content = (
        <div>
          <Separator style={styles.separator}/>
          <span>
            Thanks for your contribution to the CK-12 Community!
          </span>
        </div>
      );
    }
    else if(publishing)
    {
      content = (
        <div>
          <Separator style={styles.separator}/>
          <span>
            Publishing '{artifactTitle}'<br/>
            Please wait...
            <img src={LOADINGICON} width="43" height="11"/>
          </span>
        </div>
      );
    }
    return {title, content, loading};
  }

  render(){
    let messageProps = this.getMessageModalInfo(),
    {title} = this.props,
    options = [
      {label:'CK-12 Content derived', value:'derived'},
      {label:'Customized from other content', value:'modified'},
      {label:'Original Content', value:'original'}
    ];
    return(
      <Modal contentLabel='Publish-Modal' style={styles.modal} isOpen={true}>
        {this.state.publishing && <MessageModal className='publishMessage'
          styled = {true}
          callback={()=>this.props.onClose()}
          {...messageProps}
        />}
        <div style={styles.header}>
          <CloseModal onClick={this.props.onClose}/>
          <Header weight='normal' size='header4' style={styles.headerStyle}>Submit a Publish Request</Header>
        </div>
        <Separator/>
        <div style={styles.body}>
          <div style={styles.instruction}>Select a contribution type:</div>
          <div style={styles.options}>
            <CustomRadio options={options} handleClick={(type)=>this.selectContributionType(type)}/>
          </div>
          {this.state.error && <div style={styles.error}>Please select a contribution type</div>}
          <div>
            <Row>
              <Column small={12}>
                You're about to make '{title}' available to the public.
                <div style={styles.message}>Are you sure you'd like to do this?</div>
              </Column>
            </Row>
          </div>
        </div>
        <Separator/>
        <Row>
          <Column small={12} style={styles.buttonContainer}>
            <Button color='turquoise' style={styles.leftButton} handleClick={()=>this.handleClick()}>Publish</Button>
            <Button color='grey' handleClick={()=>this.props.onClose()}>Cancel</Button>
          </Column>
        </Row>
      </Modal>
    );
  }

  selectContributionType(type){
    this.setState({
      type,
      error:false
    });
  }

  handleClick(){
    let {artifactRevisionID} = this.props,
    {type} = this.state;
    if(!type)
    {
      this.setState({
        error:true
      });
    }
    else
    {
      this.props.publish({
        artifactRevisionID,
        type
      });
      this.setState({
        publishing: true
      })
    }
  }
}

const styles = {
  modal:{
    overlay: {
      top: '0px',
      bottom: '0px',
      left: '0px',
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.45)',
      zIndex: 1000
    },
    content: {
      borderRadius: '5px',
      backgroundColor: 'rgba(255, 255, 255,1)',
      width: '550px',
      margin: '0 auto',
      left: 0,
      right: 0,
      overflow: 'visible',
      bottom: 0,
      position: 'relative',
      top: 160,
      padding: 0
    }
  },
  options: {
    marginBottom: '10px',
    fontWeight: '500'
  },
  instruction: {
    fontSize: '18px',
    marginBottom: '10px'
  },
  header: {
    padding: '8px 16px',
    textAlign: 'center',
    marginBottom: '-20px'
  },
  buttonContainer: {
    textAlign: 'center',
    paddingBottom: '20px'
  },
  body: {
    margin: '-5px 15px'
  },
  text: {
    paddingTop: '5px',
    paddingBottom: '10px'
  },
  message: {
    paddingTop: '5px',
    paddingBottom: '10px'
  },
  leftButton: {
    marginRight: '10px'
  },
  error:{
    paddingBottom: '10px',
    color:'#ff6633'
  },
  separator:{
    marginTop: '10px',
    marginBottom: '10px'
  }
};



const mapStateToProps = (state) => {
  let title = getSectionTitle(state),
  artifactRevisionID = getCurrentArtifactRevisionID(state),
  isPublished = isArtifactPublished(state);
  return {
    title,
    artifactRevisionID,
    isPublished
  };
};

export default connect(
  mapStateToProps,
  {
    publish
  }
)(Publish);
