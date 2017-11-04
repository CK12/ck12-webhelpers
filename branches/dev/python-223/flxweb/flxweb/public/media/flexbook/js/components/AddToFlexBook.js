import React from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import Link from './common/Link';
import Icon from './common/Icon';
import Button from './common/Button';
import Spinner from './common/Spinner';
import {ATBIMAGEICON,LOADINGICON} from '../constants/constants';
import {initAddToFlexBook, addToFlexBook} from '../actions/actions.js';
import { getCurrentSectionArtifact, getFetchLibraryContent} from '../selectors/selectors.js';
import {UNTITLED} from '../constants/placeholders';
import MessageModal from '../components/MessageModal';
import {SELECT_BOOK,ARTIFACT_EXISTS_ALREADY,ALREADY_PART_OF_ARTIFACT,CONNECTION_ERROR} from '../constants/errors.js';
import Separator from './common/Separator';
import TopNotification from './common/TopNotification';
import {getFlexbookLink}from '../utils/utils';

class AddToFlexBook extends React.Component {
  constructor () {
    super();
    this.state = {
      open: true,
      showTextBox: false,
      showErrorModal: false,
      showMessageModal:false,
      ready:false
    };
    this.observeScrollBar = this.observeScrollBar.bind(this);
  }
  refresh(start = 1){
    this.props.initAddToFlexBook(start);
    this.setState({
      start:start+1
    });
  }
  observeScrollBar(){
    let {fetchLibrary:{loading,totalBooks,booksList}}=this.props;
    let that = document.getElementById('books-list');
    let displayedBooksLength = Math.min(booksList.length,(this.state.start-1)*10);
    //Loading more books when scroll has reached the bottom
    if(!loading && that.scrollTop==(that.scrollHeight-262) && displayedBooksLength<totalBooks)
    {
      this.refresh(this.state.start);
    }
  }

  onSuccess(artifact){
    let {title: bookTitle} = artifact,
    link = getFlexbookLink(artifact),
    successContent=(
      <span>
        Added to FlexBook® textbook 
        <Link target='_blank' style={{color:'white'}} href={link}> {bookTitle}</Link>
      </span>
    );
    this.setState({
      successContent,
      showNotification:true,
      open:false
    });
  }

  componentDidUpdate(){
    let {fetchLibrary:{flexbook,loading}} = this.props;
    if(flexbook!==undefined && flexbook.artifact && !this.state.showNotification) //Check if the flexbook was added successfully and close Modal
    {
      let {artifact} = flexbook
      this.onSuccess(artifact)
    }

    if(!this.state.ready && !loading) //Add listener for scroll pagination once booksList is loaded
    {
      document.getElementById('books-list').addEventListener("scroll", this.observeScrollBar);  
      this.setState({
        ready:true
      });
    }
  }

  componentDidMount(){
    this.refresh();
  }
  componentWillUnmount(){
    var bookListID = document.getElementById('books-list');
    if(bookListID)
    {
      document.getElementById('books-list').removeEventListener("scroll", this.observeScrollBar);
    }
  }
  openModal () {
    this.setState({open: true});
  }

  closeModal () {
    this.setState({open: false,showTextBox: false,onceRequest:false});
    this.props.callbackParent(false);
  }

  closeMessageModal(){
    this.setState({
      showMessageModal: false,
      showErrorModal:false
    });
  }

  showNewBook(){
    this.setState({
      showTextBox: true,
    });
    this.selectNewFlexBook();
  }
  add(){
    let {title,newOption,newFlexBook,artifactRevisionID} = this.state,
      {artifact,fetchLibrary:{booksList}} = this.props,
      titleCheck = true,
      errorMessage=SELECT_BOOK,
      isNew=false;
    this.setState({
      showMessageModal:true
    });

    if(newOption)
    {
      title=newFlexBook;
      isNew=true;
    }

    if(title && titleCheck){
      this.props.addToFlexBook(artifact,{ artifactRevisionID, title, isNew});
    }
    else{
      this.setState({
        showErrorModal: true,
        errorMessage
      });
    }
  }

  getBookList(){
    let {fetchLibrary: {loading,booksList}} = this.props,
      that = this,
      displayBook;
    if(this.state.ready){
      if(booksList.length > 0 ){
        booksList=booksList.slice(0,(this.state.start-1)*10); //To display the books 10 at a time
        displayBook = booksList.map(function (child) {
          let title = child.title,
	        artifactRevisionID = child.revisions[0].id;
          return (
            <div
              style = {Object.assign({}, styles.atbBook,styles.atbChildren)}
              key={artifactRevisionID}>
              <div>
                <input
                  type="radio"
                  name="atb_book"
                  style={styles.radioButton}
                  value={artifactRevisionID}
                  checked={that.state.artifactRevisionID === artifactRevisionID}
                  onChange={()=>that.handleChange(title,artifactRevisionID)}/>
                <div style={styles.parentImage}>
                  <img src={ATBIMAGEICON} width="23px"/>
                </div>
                <div style={styles.titleWrap}>
                  <label onClick={()=>that.handleChange(title,artifactRevisionID)} style={styles.bookTitle}>
                    {child.title}
                  </label>
                </div>
              </div>
            </div>
          );
        });
      }
    }else{
      displayBook =
      <Spinner>
      </Spinner>
      ;
    }
    return displayBook;
  }

  getMessageModalInfo(){
    let {fetchLibrary:{addingBook, flexbook ,error, errorInfo}} = this.props;
    let content;

    if(addingBook)
    {
      let bookTitle = flexbook.title;
      content = (
        <div>
          <Separator style={styles.separator}/>
          <span>
            Adding to FlexBook® textbook "{bookTitle}"<br/>
            Please wait...
            <img src={LOADINGICON} width="43" height="11"/>
          </span>
        </div>
      );
    }
    else 
    {
      let errorMessage
      if(this.state.showErrorModal){
        errorMessage = this.state.errorMessage;
      }
      else if(error)
      {
        errorMessage =  errorInfo.statusCode?
          (this.state.newOption?ARTIFACT_EXISTS_ALREADY:ALREADY_PART_OF_ARTIFACT)
          :CONNECTION_ERROR;
      }

      content = (
        <div>
          <Separator style={styles.separator}/>
          <span dangerouslySetInnerHTML={{__html: errorMessage}}/>
          <Separator style={styles.separator}/>
        </div>
      ); 
    }
    return content
  }

  render() {
    let content = this.getMessageModalInfo();
    let {fetchLibrary:{loading,addingBook}} = this.props;
    let checkBookList = this.getBookList();
    return (
      <div className='addtoflexbook'>
        {this.state.showNotification && <TopNotification content={this.state.successContent} callbackParent={()=>this.closeModal()}/>}
        { this.state.open ?
          <Modal
            isOpen={this.state.open}
            style={customStyles} contentLabel='AddToFlexBook-Modal'>
            {this.state.showMessageModal && <MessageModal className='addToFlexBookMessage'
              callback={()=>this.closeMessageModal()}
              title={
                (<span style={{color:'#222222'}}>CK-12 FlexBook® Textbook</span>)
              }
              styled = {true}
              loading={addingBook} 
              content={content}
            />}
            <div style={styles.headerContainer}> Add to your FlexBook® </div>
            <div
              style={styles.close}
              onClick={()=>this.closeModal()}>+</div>
            <div style={styles.mainContainer}>
              <div id='books-list' style= {styles.maxHeightSpace}>
                <div style = {Object.assign({}, styles.atbBook,styles.atbFirstChild)}>
                  {
                    (!this.state.showTextBox) ?
                    <Link onClick={()=> this.showNewBook()}>
                      <span style={styles.newBookHeader}>
                        <Icon name= {'plus'} style={styles.newBook}/>
                      </span>
                      <span style={styles.createBook}>
                        Create a New FlexBook® Textbook
                      </span>
                    </Link>
                    :
                    <div>
                      <input
                        type="radio"
                        name="atb_book"
                        style={styles.radioButton}
                        checked={this.state.artifactRevisionID=='isNew'}
                        onChange={()=>this.selectNewFlexBook()}/>
                      <div style={styles.parentImage}>
                        <img src={ATBIMAGEICON} width="23px"/>
                      </div>
                      <div style={styles.titleWrap}>
                        <input
                          style={styles.bookTitle}
                          maxLength="100"
                          type="text"
                          placeholder={UNTITLED}
                          onChange={(e)=>this.handleNewFlexbook(e)}/>
                      </div>
                    </div>
                  }
                </div>
                { checkBookList }
                {(this.state.ready && loading) && <Spinner></Spinner>}
              </div>
              <div style={styles.bottomPlane}>
                <div style={styles.clearFix}>
                  <Button
                    style={styles.uiButtonSize}
                    color='grey'
                    handleClick={()=>this.closeModal()}>
                    <span style={styles.uiButtonText}>Cancel</span>
                  </Button>
                  <Button
                    style={styles.uiButtonSize}
                    color='tangerine'
                    handleClick={()=>this.add()} >
                    <span style={styles.uiButtonText}>OK</span>
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
          : null
        }

      </div>
    );
  }
  handleChange(title,artifactRevisionID){
    this.setState({
      title,
      newOption:false,
      artifactRevisionID
    });
  }
  handleNewFlexbook(e){
    this.setState({
      newFlexBook: e.target.value
    });
  }
  selectNewFlexBook(){
    this.setState({
      newOption:true,
      artifactRevisionID: 'isNew'
    });
  }
}

const customStyles = {
  overlay : {
    top: '0px',
    bottom: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255,0.45)',
    zIndex: 1000,
    textAlign: 'center',
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
    height: '400px',
    width: '673px',
    border: '1px solid #aaaaaa',
    background: '#ffffff',
    color: '#222222',
    borderRadius: '10px',
    fontSize: '1.1em',
    padding: '0px',
    textAlign: 'center',
    margin: '0px auto'
  }
};

const styles = {
  separator:{
    marginTop: '10px',
    marginBottom: '10px'
  },
  headerContainer:{
    color: '#56544D',
    fontSize: '21px',
    fontWeight: 'bold',
    paddingTop:'20px'
  },
  maxHeightSpace:{
    width: 'auto',
    minHeight: '0px',
    height: '262px',
    overflow:'auto'
  },
  atbBook:{
    cursor: 'pointer',
    padding: '10px 25px',
    width: '100%',
    height: '50px',
    display: 'inline-block',
    textAlign: 'left',
    whiteSpace: 'nowrap'
  },
  atbFirstChild:{
    border: '2px solid #efede7',
  },
  atbChildren:{
    borderBottomStyle: 'solid',
    borderBottomWidth:'2px',
    borderBottomColor: '#efede7'
  },
  parentImage:{
    display: 'inline-block',
    verticalAlign: 'top',
    marginLeft:'10px',
    marginRight:'10px'
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
  mainContainer:{
    height: '267px !important',
    padding: '0px',
    width: 'auto',
    minHeight: '0px'
  },
  bottomPlane:{
    borderRadius: '0px 0px 10px 10px !important',
    paddingTop: '20px',
    paddingBottom: '20px',
    border: 'none',
    borderTop: '1px solid #eee',
    color: '#707070'
  },
  clearFix:{
    textAlign: 'center',
    float: 'none'
  },
  uiButtonText:{
    lineHeight: 'inherit',
    padding: '.4em 1em'
  },
  uiButtonSize:{
    width: '123px',
    marginRight: '15px'
  },
  newBook:{
    color: '#00aba4 !important',
    fontSize: '12px'
  },
  newBookHeader:{
    color: '#56544d',
    display: 'inline-block',
    lineHeight: '16px',
    border: '2px solid #00aba4',
    marginLeft: '22px !important',
    padding: '2px 4px'
  },
  createBook:{
    color: '#56544d',
    marginLeft: '6px',
    display: 'inline-block',
    lineHeight: '16px'
  },
  titleWrap:{
    display: 'inline-block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    width: '90%',
    wordWrap: 'break-word'
  },
  bookTitle:{
    height: '30px',
    width: '80%',
    padding: '7px 10px'
  },
  radioButton:{
    verticalAlign: 'top',
    padding: '0',
    margin: '12px 2px 0 1px'
  }
};

const mapStateToProps = (state) =>{
  let artifact = getCurrentSectionArtifact(state);
  let fetchLibrary = getFetchLibraryContent(state);
  return {
    artifact,
    fetchLibrary
  };
};

export default connect(
  mapStateToProps,
  {
    initAddToFlexBook,
    addToFlexBook,
    getFlexbookLink
  }
)(AddToFlexBook);
