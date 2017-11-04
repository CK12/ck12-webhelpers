import React, {PropTypes,Component} from 'react';
import Modal from 'components/Modal';
import {remove} from 'lodash';
import { ImageInput } from 'components/common/forms';
import {validateImage,uploadImage} from 'utils/uploadImage';
import { showModal,hideModal} from 'actions/modalActions';
import * as reportIssueActions from 'actions/reportIssueActions';

let _lists=[] , _isActive='';
class PostFeedbackModal extends Component{
    constructor(props){
        super(props);
        this.onLoadImage = this.onLoadImage.bind(this);
        this.addImageInList = this.addImageInList.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
        this.refreshModal = this.refreshModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.sendFeedback = this.sendFeedback.bind(this);
        this.onKeyupTextContainer = this.onKeyupTextContainer.bind(this);
    }
    componentWillMount(){
        _lists=[] , _isActive='';
    }
    onLoadImage(e){
        e.preventDefault();

        const { dispatch } = this.props;
        let file = e.target.files[0];
        let validate = validateImage(file);

        if(validate && validate.valid){
            uploadImage(file,this.addImageInList);
        }else{
            console.log("error in upload image type")
        }
    }
    onKeyupTextContainer(){
        if(this.refs.textContainer.value && this.refs.textContainer.value.trim() !== '' && _isActive === ''){
            _isActive = 'Active';
            this.refreshModal();
        }else if(this.refs.textContainer.value === '' && _isActive !== ''){
            _isActive = '';
            this.refreshModal();
        }
        if(this.refs.errorContainer.innerHTML){
            this.refs.errorContainer.innerHTML = ''
        }
    }
    deleteImage(e){
        const {imageLists} = this.props;
        let _id = e.target.id;
        _lists = Object.assign([],imageLists);
        remove(_lists,(item)=>{
            return item.id === Number(_id);
        })
        this.refreshModal();
    }
    sendFeedback(){
        const { dispatch,reportIssue,imageLists,isActive } = this.props;
        if(isActive === ''){
            this.refs.errorContainer.innerHTML = 'Please enter your feedback.'
            return;
        }
        var data = {
            reason:this.refs.textContainer.value,
            reasonID: 6,
            imageUrl: imageLists[0] && imageLists[0].imageUrl,
            artifactID:reportIssue.artifactID
        }
        reportIssueActions.postReportIssue(dispatch,data);
    }
    closeModal(){
        this.props.dispatch(hideModal());
    }
    addImageInList(file){
        const { imageLists} = this.props;
        const obj = {
            'id':file.id,
            'name':file.name,
            'imageUrl':file.uri
        }
        _lists = Object.assign([],imageLists);
        //removing duplicate name image
        remove(_lists,(item)=>{
            return item.name === file.name;
        })
        _lists.push(obj);
        this.refreshModal();
    }
    refreshModal(){
        const { dispatch ,reportIssue} = this.props;
        dispatch(showModal({
            modalType: 'PostFeedbackModal',
            modalProps: {
                preventOverlayClick: true,
                hideCloseButton: false,
                imageLists:_lists,
                isActive:_isActive,
                reportIssue
            }
        }));
    }
    render(){
        let props = this.props;
        return (
            <Modal maxWidth='medium' {...props}>
                <div id="ReportIssueView">
                    <div className='reportIssue-container'>
                        <div className="header">How can we improve your dashboard experience?</div>
                        <div className="info-container">
                            <textarea onChange={this.onKeyupTextContainer} id="reportIssueText" ref='textContainer' rows="4" cols="50" type="text" maxLength="300" className="comment-box" placeholder="Please enter your feedback here."></textarea>
                        </div>
                        <div ref='errorContainer' id="uploadError"></div>

                        <div className="upload-img-list" id="imageList">
                        {props.imageLists.map(
                            (list,key)=>{
                                return <div key={key} className="upload-img">{list.name}<span id={`${list.id}`}  onClick={this.deleteImage} className="icon-close2 delete-icon"></span></div>
                            }
                        )}
                        </div>

                        <div className="upload-images">
                            <ImageInput className="input-image" id="inputImage" type="file" onChange={this.onLoadImage}/>
                            <span className="upload-icon"></span>
                            <span className="upload-text"> Upload Image (optional) </span>
                        </div>
                        <div className="button-container ">
                            <div id="sendReport" className={`send-button report-button ${props.isActive}`} onClick={this.sendFeedback}>SEND</div>
                            <div id="cancelReport" className="cancel-button report-button" onClick={this.closeModal}>CANCEL</div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
};

PostFeedbackModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
};

export default PostFeedbackModal;
