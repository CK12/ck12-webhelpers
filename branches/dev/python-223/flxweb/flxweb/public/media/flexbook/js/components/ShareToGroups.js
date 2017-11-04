import {SELECT_GROUPS} from '../constants/errors.js';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import NoGroups from './NoGroups';
import MessageModal from './MessageModal';
import Groups from './Groups';
import Button from './common/Button';
import Link from './common/Link';
import Spinner from './common/Spinner';
import isEmpty from 'lodash/isEmpty';
import Radium from 'radium';
import {getGroups, getCurrentID, getSharedInfo, areGroupsLoaded, getSectionTitle} from '../selectors/selectors';
import {shareToGroups, resetShareInfo, fetchGroups} from '../actions/groups';
import enhanceWithClickOutside from 'react-click-outside';
import {formatHandle} from '../utils/utils';

@Radium
class ShareToGroups extends Component {
  constructor () {
    super();
    this.state = {
      shared: false,
      selectedGroups: []
    };
  }

  componentDidMount(){
    this.props.fetchGroups();
  }

  handleClickOutside() {
     this.closeModal();
   }

  closeModal () {
    this.props.callbackParent(false);
  }

  componentWillReceiveProps(nextProps){
    if(!this.state.shared && nextProps.shared == true){
      this.setState({
        shared: true,
        sharedGroups: nextProps.sharedGroups,
        isSharing: false
      });
    }
    else{
      this.setState({
        shared: false
      });
    }
}
  componentDidUpdate(prevState, prevProps){
    prevState.shared && this.props.resetShareInfo();
  }

  render() {
    let {title, style, isMobile} = this.props,
    {sharedGroups, shared} = this.state,
    links = sharedGroups && sharedGroups.map((g,index)=>
      <span key={index}>
        <Link href={`/group-resources/${g.id}`}>{g.name}</Link>
        { sharedGroups.length - 1 === index ? '' : ', '}
      </span>),
    content = (  <div>You have successfully shared {`'${title}'`} to your groups: {links}</div>),
    buttonText = this.state.isSharing?'Sharing...':'Share';
    return (
      <div className='sharetogroups' style={[styles.container, style]}>
        { this.state.shared && !isEmpty(sharedGroups)?
          <MessageModal
            content={content}
            title='Success!'
            icon='checkmark'
            iconClass='green-checkmark'
            isMobile={isMobile}/>:
          <div style={styles.modal}>
              <div className="groups_share_dialog">
                <div>
                  <strong style={styles.customeFontSize}>Share to Groups </strong>
                </div>
                {
                  this.props.loaded?
                  isEmpty(this.props.groups)? <NoGroups/> : (
                    <div>
                      <div style={this.state.isInvalid ?styles.error :styles.noError}>
                          {SELECT_GROUPS}
                      </div>
                      <Groups ref='groups' groups={this.props.groups} toggleGroup={(data)=>this.toggleGroup(data)}/>
                      <span onClick={()=>this.shareToGroups()}>
                        <Button style={this.state.isSharing?styles.buttonSharing:{}} color='tangerine'> {buttonText}</Button>
                      </span>
                      <span style={{margin: '10px'}}> or </span>
                      <Link href='/my/groups/#create'>Create a New Group</Link>
                    </div>
                  )
                  :<Spinner/>
              }
            </div>
          </div>
        }
      </div>
    );
  }

  toggleGroup(data){
    let {id, isSelected} = data;
    let selectedGroups = [...this.state.selectedGroups];
    if(isSelected)
    selectedGroups.push(id);
    else
    selectedGroups = selectedGroups.filter((g) => g!=id);
    this.setState({selectedGroups});
    this.removeErrorIfValid(selectedGroups);
  }

  shareToGroups(){
    if(this.isValidSelection()){
      this.props.shareToGroups({
        objectID: this.props.id,
        groupIDs: this.state.selectedGroups.toString(),
        url: location.href
      });
      this.setState({
        isSharing: true
      });
    }
    else{
      this.setState({
        isInvalid: true
      });
    }
  }

  isValidSelection(){
    return !isEmpty(this.state.selectedGroups);
  }

  removeErrorIfValid(selectedGroups){
    if(this.state.isInvalid){
      if(!isEmpty(selectedGroups))
        this.setState({
          isInvalid: false
        });
    }
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
    backgroundColor: 'rgba(255,255,255,0)'
  },
  content : {
    backgroundColor: 'rgba(255, 255, 255,0)',
    position: 'absolute',
    overflow: 'visible',
    bottom: 'initial',
    border:'none',
    top: 270,
    left: 280
  }
};

const styles = {
  customeFontSize:{
    fontSize: '21px'
  },
  error: {
    color: '#fb6c33',
    fontSize: 12
  },
  noError: {
    display: 'none'
  },
  container: {
    position: 'relative'
  },
  modal: {
    '@media screen and (min-width: 768px)':{
      position: 'absolute',
      bottom: '-44px',
      left: '110%'
    },
    '@media screen and (max-width: 767px)':{
      position: 'absolute'

    }
  },
  buttonSharing: {
    borderBottom: '3px solid #FF6633',
    backgroundColor: '#D9491A',
    color:'#FFF'
  }
};

const mapStateToProps = (state) => {
  let groups = getGroups(state),
  id = getCurrentID(state),
  title = formatHandle(getSectionTitle(state)),
  loaded = areGroupsLoaded(state);
  let { shared, sharedGroups }= getSharedInfo(state);
  return {
    id,
    groups,
    shared,
    sharedGroups,
    loaded,
    title
  };
};

export default connect(mapStateToProps,{
  shareToGroups,
  resetShareInfo,
  fetchGroups
})(enhanceWithClickOutside(ShareToGroups));
