import React from 'react';
import Link from './common/Link';
import Separator from './common/Separator';
import Icon from './common/Icon';
import AddToLibrary from './AddToLibrary';
import ShareToGroups from './ShareToGroups';
import DownloadPDF from './DownloadPDF';
import Publish from './Publish';
import AddToFlexBook from './AddToFlexBook';
import OfflineReader from './OfflineReader';
import AssignToClassHelperPopup from './AssignToClassHelperPopup';
import { showSigninDialog, assignToClass} from '../utils/requireBridge';
import { EDITFLEXBOOKSUPPORT, OPEN_IN_APP_LINK } from '../constants/constants';
import * as SideNavOptions from '../constants/sidenav';
import * as Tooltips from '../constants/tooltips';
import Radium from 'radium';
import ReactTooltip from 'react-tooltip';
import includes from 'lodash/includes';
import * as ArtifactTypes from '../constants/artifactTypes';
import {logADSEvent} from '../utils/requireBridge';
import {isMobile, formatHandle} from '../utils/utils';
import SummaryView from './SummaryView';

@Radium
class SideNavRow extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showLibraryModal: false,
      showShareLibrary: false,
      showPDFGeneration: false,
      showAddToFlexBook: false,
      showOfflineReader: false,
      showPublish: false,
      showSummary: false,
      displayQuickTips:true
    };
    this.handleQuickTipsScroll = this.handleQuickTipsScroll.bind(this);
  }
  switchHandler(e){
    let {loggedIn} = this.props;
    if(!loggedIn)
    {
      showSigninDialog();
      e && e.preventDefault();
    }
  }
  onChildChanged(newState) {
    this.setState({
      showShareLibrary: newState,
      showPDFGeneration: newState,
      showAddToFlexBook: newState,
      showLibraryModal: newState,
      showOfflineReader: newState,
      showSummary: newState
    });
  }

  handleQuickTipsScroll(){
    let windowScroll = window.pageYOffset,
    //Preference to .flexbookbottomtitle when complete loading is done
    bottomRow = document.querySelector('.flexbookbottomtitle') || document.querySelector('.backtotop'),
    bottomPosition = bottomRow.getBoundingClientRect().top + window.scrollY - 150,
    {displayQuickTips,fixQuickTips, quickTipsTop} = this.state;
    if (windowScroll > quickTipsTop){
      if(windowScroll > bottomPosition && displayQuickTips)
      {
        this.setState({
          displayQuickTips:false
        });
      }
      else if(windowScroll < bottomPosition && !displayQuickTips)
      {
        this.setState({
          displayQuickTips:true
        });
      }

      if(!fixQuickTips){
        this.setState({
          fixQuickTips:true
        });
        styles.quickTipsFixed.width = document.querySelector('.sidenav').offsetWidth;
      }
    }
    else if(fixQuickTips)
    {
      this.setState({
        fixQuickTips:false
      });
    }
  }

  componentDidMount(){
    let quickTips = document.getElementById('quick_tips');
    if(quickTips)
    {
      window.addEventListener('scroll', this.handleQuickTipsScroll);
      this.setState({
        quickTipsTop: quickTips.getBoundingClientRect().top + window.scrollY
      });
    }
  }

  componentDidUpdate(){
    let vocabulary = document.querySelector('.vocabularies'),
    {displayVocabulary}=this.state;
    if(vocabulary != displayVocabulary)
    {
      this.setState({
        displayVocabulary:vocabulary
      });
    }
  }

  componentWillUnmount(){
    window.removeEventListener('scroll', this.handleQuickTipsScroll);
  }

  openModalLibrary() {
    if(!this.props.revisionAdded){
      this.setState({showLibraryModal: true});
    }
  }
  openShareLibrary() {
    this.setState({showShareLibrary: true});
  }
  openDownloadPDF() {
    this.setState({showPDFGeneration: true});
  }
  addToFlexBook(){
    this.setState({showAddToFlexBook: true});
  }
  offlineReader(){
    this.setState({showOfflineReader: true})
  }
  showSummaryView(){
    this.setState({showSummary:true});
  }
  showAssignToClassHelper(){
    this.setState({showAssignToClassHelper: true});
  }
  closeAssignToClassHelper(){
    this.setState({showAssignToClassHelper: false});
  }
  openAssignToClass(){
    let {artifactTitle:title, artifactID} = this.props;
    assignToClass(formatHandle(title), artifactID);
  }
  closeAssignToClass(){
    this.setState({showAssignToClass: false});
  }
  openPublish(){
    this.setState({showPublish: true});
  }
  closePublish(){
    this.setState({showPublish: false});
  }
  scrollToNotes(){
    let {artifactID} = this.props;
    let data = {
      'action_type':'link',
      'action_name':'qt_annotations',
      'screen_name':'flexbook',
      'additional_params1': artifactID
    };
    logADSEvent('FBS_ACTION',data);
    document.getElementsByClassName('tab-link')[0].click(); //To navigate to 'Read' Tab
    setTimeout(function(){
      let notesTop = document.querySelector('.myAnnotations-container').getBoundingClientRect().top + window.scrollY - 100  ;
      window.scrollTo(0, notesTop);
    }, 0);
  }
  scrollToVocabulary(){
    let {artifactID} = this.props;
    let data = {
      'action_type':'link',
      'action_name':'qt_vocabulary',
      'screen_name':'flexbook',
      'additional_params1': artifactID
    };
    let vocabularyElement = document.querySelector('.vocabularies');
    if(vocabularyElement)
    {
      logADSEvent('FBS_ACTION',data);
      document.getElementsByClassName('tab-link')[0].click(); //To navigate to 'Read' Tab
      setTimeout(function(){
        let vocabularyTop = vocabularyElement.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo(0,vocabularyTop);
      },0);
    }
  }

  getLinkFromType(){
    let {type, title, icon, loggedIn, artifactOwner, isPublished, isTeacher, 
        artifactRevisionID, groupEditingDetails, artifactType, summaries} = this.props;
    let {isColloborated, isColloborater, isAssigned, isAssignee} = groupEditingDetails;
    if(!loggedIn && !includes([SideNavOptions.OFFLINE_READER, SideNavOptions.CUSTOMIZE, SideNavOptions.ASSIGN_TO_CLASS,SideNavOptions.QUICK_TIPS], type)){
      return (<Link title={title} onClick={()=>this.switchHandler()}>
          {icon?<Icon style={styles.newIcons} name={icon}/>:type}
        </Link>);
    }
    switch(type){
      case SideNavOptions.ADD_TO_LIBRARY:{
        let addedlink ={}, tooltip = title;
        if(this.props.revisionAdded){
          addedlink = styles.addedRevision;
          tooltip = 'Already in Library';
        }
        return  <Link disabled={artifactOwner} title={tooltip} style={addedlink} onClick={()=>this.openModalLibrary()}>
                  {icon?<Icon style={[styles.newIcons,addedlink]} name={icon} />: type}
                </Link>;
      }
      case SideNavOptions.ADD_TO_FLEXBOOK_TEXTBOOK:
        return  <Link disabled={isColloborated && (artifactOwner || isColloborater)} title={title} onClick={()=>this.addToFlexBook()}>
                  {icon?<Icon style={styles.newIcons} name={icon}/> : type}
                </Link>
      case SideNavOptions.SHARE_TO_GROUPS:
        return  <Link disabled={isColloborated && (artifactOwner || isColloborater)} title={title} onClick={()=>this.openShareLibrary()}>
                  {icon? <Icon style={styles.newIcons} name={icon}/> : type}
                </Link>
      case SideNavOptions.CUSTOMIZE:{
        let {loggedIn, customizeLinkOptions: {editLink, editVerb}} = this.props;
      
        if(!editVerb)
          return null;

        let tooltip = title,
        isEdit = false,
        viewLatest = editVerb && editVerb.indexOf('View Latest')>=0;

        if(!viewLatest && editVerb && editVerb.indexOf('Edit')>=0)
        {
          isEdit = true;
          if(title==SideNavOptions.CUSTOMIZE_TITLE)
          {
            tooltip = SideNavOptions.EDIT_TITLE;
          }
          else if(title==SideNavOptions.CUSTOMIZE_TITLE_SECTIONS)
          {
            tooltip = SideNavOptions.EDIT_TITLE_SECTIONS;
          }  
        }
        let supportLink = icon || viewLatest ? '':
          (<span>
            <Link title={tooltip} href={EDITFLEXBOOKSUPPORT} target={'_blank'} style={styles.helpIcon} className="icon-help_icon"/>
          </span>);
        //Edit option should be disabled for Owners and Colloboraters for read modalities of Colloborated Flexbooks
        let disabled = isAssigned && !isAssignee && includes(ArtifactTypes.SECTION_TYPES, artifactType) && isEdit;
        
        return (
          <div><Link disabled={disabled} title={tooltip} onClick={(e)=>this.switchHandler(e)} href={editLink}>
            {icon?<Icon style={styles.newIcons} name={icon} />: editVerb || 'Customize'}
          </Link>{supportLink}</div>);
      }
      case SideNavOptions.DOWNLOAD_PDF:{
        if(this.props.sourcePDF != '')
         return (<Link title={title} href= {this.props.sourcePDF} title={this.props.titlePDF}>
                {type}
                </Link>);
        return (<Link  title={title} onClick={()=>this.openDownloadPDF()}>{type}</Link>);
      }
      case SideNavOptions.OFFLINE_READER:{
        if(isMobile())
        {
          return null;
        }
        return (<div>
          <Link title={title} style={styles.offlineReader} onClick={()=>this.offlineReader()}>{type}</Link>
          <span data-tip={Tooltips.OFFLINE_READER} data-html={true} id='tt-offlineReader' style={[styles.offlineReader, styles.helpIcon]} className='icon-help_icon'/>
          <ReactTooltip data-for='tt-offlineReader'/>
        </div>);
      }
      case SideNavOptions.ASSIGN_TO_CLASS:
      {
        if(!loggedIn || !isTeacher)
          return false;
        return (<div>
          <Link title={title} style={styles.assignToClass} onClick={()=>this.openAssignToClass()}>{type}</Link>
          <span className='icon-Info' style={[styles.assignToClass, styles.helpIcon]} onClick={()=>this.showAssignToClassHelper()}/>
          {this.state.showAssignToClassHelper && <AssignToClassHelperPopup closePopup={()=>this.closeAssignToClassHelper()}/>}
        </div>);
      }
    case SideNavOptions.EDIT:
      return(<div>
        <Link title={title}>{type}</Link>
      </div>);
    case SideNavOptions.PUBLISH:
      let addedlink = (isPublished) ? styles.addedRevision : {};
      type = isPublished?SideNavOptions.PUBLISHED : type;
      return (<Link disabled={isPublished} styles={addedlink} title={title} onClick={()=>this.openPublish()}>{type}</Link>);
    case SideNavOptions.QUICK_TIPS:{
      let notesTitle = 'Notes\/Highlights',
      vocabularyTitle= 'Vocabulary',
      summaryTitle='Summary';
      return (
        <div>
          {this.state.displayQuickTips &&
            (<div id='quick_tips' style={this.state.fixQuickTips ? styles.quickTipsFixed:{}}>
              {!icon && <div style={styles.quickTipsTitle}>Quick tips</div>}
              <div style={icon?styles.iconQuickTips:styles.quickTipsContent}>
                <Link title={notesTitle} onClick={()=>this.scrollToNotes()}>
                  {icon? <Icon style={styles.newIcons} name={icon.notes}/> : notesTitle}
                </Link>
              </div>
              {this.state.displayVocabulary &&
                <div style={icon?styles.iconQuickTips:styles.quickTipsContent}>
                  <Link title={vocabularyTitle} onClick={()=>this.scrollToVocabulary()}>
                    {icon ? <Icon style={styles.newIcons} name={icon.vocabulary}/> : vocabularyTitle}
                  </Link>
                </div>
              }
              {summaries!='' && (<div style={icon?styles.iconQuickTips:styles.quickTipsContent}>
                <Link className='artifact_summary_dialog' title={summaryTitle} onClick={()=>this.showSummaryView()}>
                  {icon ? <Icon style={styles.newIcons} name={icon.summary}/> : summaryTitle}
                </Link>
              </div>)}
              
              {icon && 
                <div>
                  <span data-tip={Tooltips.OFFLINE_READER} data-html={true} id='tt-offlineReader'>
                    <Link onClick={()=>this.offlineReader()}><Icon style={styles.newIcons} name={icon.offline}/></Link>
                  </span>
                  <ReactTooltip data-for='tt-offlineReader'/>
                </div>}
            </div>)}
        </div>)
    }
    case SideNavOptions.OPEN_APP:
      return(<div>
        <Link title={title} href={OPEN_IN_APP_LINK + artifactRevisionID} >{type}</Link>
      </div>);
    default:
      console.warn('Unrecognized Sidebar!');
      break;
    }
  }

  getModal(){
    let {showOfflineReader, showLibraryModal, showShareLibrary, showPDFGeneration, showAddToFlexBook, showAssignToClass, showPublish, showSummary} = this.state;
    if(showLibraryModal)
      return <AddToLibrary callbackParent={(val)=>this.onChildChanged(val)}/>;
    if(showShareLibrary)
     return <ShareToGroups callbackParent={(val)=>this.onChildChanged(val)}/>;
    if (showPDFGeneration)
      return <DownloadPDF state = { this.state.showPDFGeneration } callbackParent={(val)=>{this.onChildChanged(val)}}/>;
    if (showAddToFlexBook)
      return <AddToFlexBook callbackParent={(val)=>this.onChildChanged(val)}/>;
    if (showAssignToClass)
      return <AssignToClass onClose={()=>this.closeAssignToClass()}/>;
    if (showPublish)
      return <Publish onClose={()=> this.closePublish()}/>
    if (showOfflineReader)
      return <OfflineReader callbackParent={(val)=>this.onChildChanged(val)}/>;
    if(showSummary)
      return <SummaryView callbackParent={(val)=>this.onChildChanged(val)}/>;
    return null;
    }

  render() {
    let customizeInfo = {};
    let link = this.getLinkFromType(),
    modal = this.getModal(),
    {type,isNewSideNav} = this.props,
    className = type.toLowerCase().replace(/ /g, '');
    return !!link? (<div className='sidenavrow' style={styles.container}>
      <Separator size='medium' style={isNewSideNav?styles.visibility:{}} />
      <span className={className}>{link}</span>
      {modal}
    </div>): null;
  }
}

const styles = {
  quickTipsTitle: {
    fontSize: '18px',
    paddingBottom: '10px'
  },
  iconQuickTips:{
    paddingBottom: '20px'
  },
  quickTipsContent: {
    paddingLeft: '15px',
    paddingBottom: '5px',
    '@media screen and (max-width:1023px)':{
      paddingLeft: '10px'
    }
  },
  quickTipsFixed: {
    zIndex:'1',
    position: 'fixed',
    top: '100px',
    backgroundColor: '#f9f9f5',
    height: 'auto',
    paddingTop: '10px'
  },

  container: {
    fontSize: 16
  },
  visibility: {
    visibility: 'hidden'
  },
  addedRevision:{
    color: '#56544d',
    cursor: 'default',
    ':hover': {
      color: '#56544d'
    }
  },
  offlineReader: {
    color: '#FF6633',
    fontWeight: 'bold'
  },
  assignToClass: {
    color: '#FF6633'
  },
  helpIcon: {
    position: 'relative',
    top: '2px',
    left: '4px',
    cursor: 'pointer'
  },
  newIcons:{
    cursor: 'pointer',
    color: '#56544d',
    ':hover': {
      color: '#00ABA4'
    }
  }
};

export default SideNavRow;