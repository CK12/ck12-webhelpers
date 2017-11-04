import React, {PropTypes,Component } from 'react';
import { connect } from 'react-redux';
import {
    hideMessageText
} from 'actions/messageTextActions';
import styles from 'scss/components/messageText';
let textMessage = '';
let _backgroundClass = {
		'success':'',
		'error':styles.error
}
class MessageTextRoot extends Component{
	constructor(props){
		super(props);
		this.state = {
				revealed:false,
				revealClass:''
		}
	}
	componentWillUpdate(){
		const { messageText: {messageType, message} } = this.props;
		if(message !==''){
			textMessage = message;
		}
	}
	componentDidUpdate(){
		const { messageText: {messageType, message} } = this.props;
		
		if(message !== '' && !this.state.revealed){
			let left = (window.innerWidth - this.refs.messageText.clientWidth)/2 > 0 ? (window.innerWidth - this.refs.messageText.clientWidth)/2 : 0;
			this.setState(Object.assign({},this.state,{
				revealed:true,
				revealClass:`${styles.translateRoot}`,
				style:{
					left:`${left}px`
				}
			}))
			
						
			setTimeout(()=>{
				this.props.hideMessageText();
			},4000)
		}
		
		if(message === '' && this.state.revealed){
			let left = (window.innerWidth - this.refs.messageText.clientWidth)/2 > 0 ? (window.innerWidth - this.refs.messageText.clientWidth)/2 : 0;
			this.setState(Object.assign({},this.state,{
				revealed:false,
				revealClass:'',
				style:{
					left:`${left}px`
				}
			}))
		}
	}
	render(){
		const { dispatch, messageText: {messageType, message} } = this.props;
		const backgroundClass = _backgroundClass[messageType];
		return 	<div ref='messageText' style={this.state.style} className={`${styles.messageTextRoot} ${this.state.revealClass} ${backgroundClass}`}>{message || textMessage}</div>

	}
}

MessageTextRoot.PropTypes = {
    dispatch: PropTypes.func.isRequired,
    messageText: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
    	messageText: state.messageText,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        hideMessageText: ()=>{
        	dispatch(hideMessageText())
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageTextRoot);