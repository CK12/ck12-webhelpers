import React, {PropTypes} from 'react';
import QueueableComponent from 'components/base/QueueableComponent';
import { hideMessageBox } from 'actions/messageBoxActions';

import styles from 'scss/components/MessageBox';

export default class MessageBox extends QueueableComponent {
    constructor(props) {
        super(props);

        this.state = {
            active:true
        };

        this.onOverlayClick = this.onOverlayClick.bind(this);
        this.closeMessageBox = this.closeMessageBox.bind(this);
    }

    componentDidMount(){
        super.componentDidMount();
        this.backgroundCanScroll(!!this.props.allowBackgroundScroll);
    }

    componentWillUnmount(){
        super.componentWillUnmount();
        this.backgroundCanScroll(true);
    }

    backgroundCanScroll(shouldScroll = false){
        const type = shouldScroll ? 'remove' : 'add';
        document.body.classList[type]('noScroll');
    }

    onOverlayClick(){
        if(this.props.preventOverlayClick){ return; }
        this.closeMessageBox();
    }

    closeMessageBox(){
        this.setState(Object.assign({},this.state,{active:false}));
        this.queue.add(
            setTimeout(()=> this.props.dispatch(hideMessageBox()), 420)
        );
    }

    render() {
        const { message, hideCloseButton, messageType } = this.props;
        let animateClass = this.state.active ? "fadeInDown" : "fadeOutUp";
        return (
            <div>
                <div onClick={this.onOverlayClick} className={`${styles.overlay}`}></div>
                <div className={`${styles.messageBox} modal-uikit ${animateClass} animated`}>
                    <CloseButton onClick={this.closeMessageBox} hideCloseButton={hideCloseButton} />
                    <Message message={message} messageType={messageType} />
                    <div className={`${styles.buttonsContainer}`}>
                		{
                			(
            					(messageType)=>{
                    				switch (messageType){
                    				case "success":
                    					return <OkButton onClick={this.closeMessageBox} messageType={messageType} />
                    		        default:
                    		            return <OkButton onClick={this.closeMessageBox} messageType={messageType} />
                    				}
                    			}
                			)()
                		}
                	</div>
                </div>
            </div>
        );
    }
}

MessageBox.propTypes = {
    dispatch: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired
};

const CloseButton = ({onClick, hideCloseButton}) => {
    if(hideCloseButton){ return null; }
    return (
       <span onClick={onClick} className={`${styles.closeButton} close`}>+</span>
    );
};
const Message = ({message, messageType}) => {
    return (
        <div className={`${styles.messageText}`}>{message}</div>
    );
};
const OkButton = ({onClick,messageType}) => {
    return (
        <div className={`${styles.standardButton} ${styles.okButton}`} onClick={onClick}>OK</div>
    );
};