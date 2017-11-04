import React, {PropTypes,Component} from 'react';
import Modal from 'components/Modal';
import styles from 'scss/components/JoinGroupModal';
import { showModal,hideModal} from 'actions/modalActions';
import * as groupsActions from 'actions/groupsActions';

class JoinGroupModal extends Component{
	constructor(props){
	   super(props);
	   this.state = {
			   inputCode:'',
			   errorText:''
	   }
	   this.joinGroup = this.joinGroup.bind(this);
	   this.closeModal = this.closeModal.bind(this);
	   this.setInput = this.setInput.bind(this);
	}
	setInput(evt){
	    this.setState({
	    	inputCode: evt.target.value,
	    	errorText:''
	    });
	}
	joinGroup(){
		const {dispatch} = this.props;
		
		if(this.state.inputCode === ''){
		    this.setState({
		    	errorText: 'You did not enter code. Please enter the code of the group you want to join.'
		    });
		    
		    return false;
		}		
		groupsActions.joinGroup({accessCode:this.state.inputCode},dispatch);
	}
    closeModal(){
        this.props.dispatch(hideModal());
    }
	render(){
		const props = this.props;
		const style = {
				width:'auto',
				maxWidth:'440px'
		}
	    return (
	        <Modal maxWidth='small' {...props} style={style}>
	            <JoinGroupContent closeModal={this.closeModal} joinGroup={this.joinGroup} setInput={this.setInput} errorText={this.state.errorText}/>
	        </Modal>
	    );
	}
}
const JoinGroupContent = (props) => {
	const errorClass = props.errorText ? styles.inputError : ''; 
	return (
			<div className={`${styles.joinGroupContent}`}>
				<div className={`${styles.header}`} >Join a group</div>
				<div>Enter the code that was given to you by the group leader.</div>
				<div className={`${styles.groupCodeWrapper}`}>
					<span className={`${styles.groupCodeText}`}>Group Code: </span>
					<input className={`${styles.groupCodeInput} ${errorClass}`} type="text" maxLength={`5`} onChange={props.setInput}/>
				</div>
				<div className={`${styles.errorContainer}`}>{props.errorText}</div>
				<div className={`${styles.buttonsContainer} ${styles.joinGroupbuttonsContainer}`} >
					<JoinButton onClick={props.joinGroup} />
					<span className={`${styles.textInBtw}`}> or </span>
					<CancelButton onClick={props.closeModal} />
				</div>
			</div>
	)
}
const JoinButton = ({onClick}) => {
    return (
        <span className={`${styles.standardButton} ${styles.joinGroupButton}`} onClick={onClick}>Join Group</span>
    );
}
const CancelButton = ({onClick}) => {
    return (
        <span className={`${styles.normalButton}`} onClick={onClick}>Cancel</span>
    );
}
JoinGroupModal.propTypes = {
    dispatch: PropTypes.func.isRequired
};

export default JoinGroupModal;