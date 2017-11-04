import React, {PropTypes,Component } from 'react';
import { connect } from 'react-redux';
import MessageBox from 'components/MessageBox';

class MessageBoxRoot extends Component{
	render(){
		const { dispatch, messageBox: {messageType, message} } = this.props;

		if (!messageType || message === "") { return null; }else{
			return 	<MessageBox dispatch={dispatch} messageType={messageType} message={message} />
		}
	}
}

MessageBoxRoot.propTypes = {
    dispatch: PropTypes.func.isRequired,
    messageBox: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
    	messageBox: state.messageBox,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageBoxRoot);