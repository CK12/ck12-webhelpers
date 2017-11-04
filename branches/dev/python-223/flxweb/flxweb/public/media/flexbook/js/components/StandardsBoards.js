import React, {Component} from 'react';
import Link from './common/Link';
import HideShowLinks from './common/HideShowLinks';
import Separator from './common/Separator';
import Select from './common/Select';
import Header from './common/Header';
import Spinner from './common/Spinner';
import Modal from 'react-modal';
import {connect} from 'react-redux';
import {fetchStandard} from '../actions/actions';
import {getSelectedStandard, getArtifactStandards, getArtifactID} from '../selectors/selectors';
import isEmpty from 'lodash/isEmpty';

class StandardsBoards extends Component{
  constructor(){
    super();
    this.state = {
      isModalOpen: false
    };
  }

  generateStandardsLinks(){
    let div = document.createElement('div');
    div.innerHTML = this.props.standards;
    let script = div.querySelector('script');
    script && eval(script.innerHTML);
    let links = [], linksHTML = [];
    let standardBoards = window.standardBoards;
    if(standardBoards && !isEmpty(standardBoards)){
      for(var i = 0; i < standardBoards.length; i++){
        let board = standardBoards[i],
          {name, id} = board;
        links.push({label: name, value: id, name});
        linksHTML.push(
          <span key= {`stdlink-${i+1}`} onClick={()=>this.openStandard(id, name)}>
            <span>
              {!!i && ','}
            </span>
            <span className='imgwrap'></span>
            <Link>
              {` ${name}`}
              </Link>
          </span>
        );
      }
    }
    return {
      links,
      linksHTML
    };
  }

  render(){
    let {linksHTML, links} = this.generateStandardsLinks();
    let {selectedStandard} = this.props;
    let {name} = this.state;
    let standardHTML = selectedStandard && name && this.insertStandardNameinHTML(selectedStandard, name) ;
    if(!isEmpty(linksHTML))
    {
      return(
        <div className='std_links standardsboards'>
          <HideShowLinks links={linksHTML} limit={6}/>
          <Modal
            isOpen={this.state.isModalOpen}
            style={styles.modal}
            contentLabel='Standards-Boards-Modal'>
            <Header size='header4' style={styles.header}> Standards Correlations </Header>
            <div
              onClick={()=>this.closeModal()}
              style={styles.close}>
             <span>&#10006;</span>
            </div>
            <Separator/>
            <div style={styles.selectContainer}>
              <span> Standards: </span>
              <Select style={{backgroundColor:'white'}} options={links} value={this.state.id} onChange={(url, name)=>this.openStandard(url, name)}/>
            </div>
            <div>

            </div>
            {standardHTML? <div dangerouslySetInnerHTML={{__html: standardHTML}} style={styles.contentContainer}></div>: <Spinner/>}
          </Modal>
        </div>);
    }
    return <span style={{textAlign: 'center'}}>-</span>;
  }

  openStandard(id, name){
    this.handleBoardSelection(id);
    if(!name){
      let board = window.standardBoards.find((b)=>b.id == id);
      board && (name = board.name);
    }
    this.setState({isModalOpen: true, id, name});
  }

  closeModal(){
    this.setState({isModalOpen: false});
  }

  handleBoardSelection(id){
    let {artifactID} = this.props,
      url = `/ajax/standards/correlated/${id}/${artifactID}`;
    this.props.fetchStandard(url);
  }

  insertStandardNameinHTML(html, name){
    let div = document.createElement('div');
    div.innerHTML = html;
    let nameDiv = div.querySelector('#std_board_name');
    nameDiv.innerHTML = name;
    return div.innerHTML;
  }
}


const mapStateToProps = (state) => {
  let selectedStandard = getSelectedStandard(state),
    standards = getArtifactStandards(state),
    artifactID = getArtifactID(state);
  return {
    standards,
    selectedStandard,
    artifactID
  };
};

const styles = {
  modal: {
    overlay: {
      backgroundColor: 'rgba(255, 255, 255,0.45)',
      zIndex: '100'
    },
    content: {
      margin: '0 auto',
      width: '70%',
      padding: 0,
      height: '570px',
      top: '50%',
      transform:'translateY(-50%)',
      boxShadow: '0 0 20px RGBA(0,0,0,.5)'
    }
  },
  close: {
    cursor: 'pointer',
    position: 'absolute',
    background: '#b3b3b3',
    color: 'white',
    padding: '4px 8px 1px',
    top: 0,
    right: 0
  },
  header: {
    textAlign: 'center',
    width: '100%',
    padding: '8px 16px'
  },
  selectContainer:{
    padding: '0px 16px 10px 16px'
  },
  contentContainer:{
    height: '434px',
    overflow: 'scroll'
  }
};


export default connect(
  mapStateToProps,
  {fetchStandard}
)(StandardsBoards);
