import React, {PropTypes,Component} from 'react';
import Modal from 'components/Modal';
import $ from 'jquery';
import {LoaderContainer} from 'components';
import styles from 'scss/components/StandardsCorrelationsModal';

class StandardsCorrelationsModal extends Component{
	constructor(props){
			super(props)
		}
	componentDidUpdate(){
		const {onChangeStandards } = this.props;
		const $el = $(this.refs.container).find("#std_drop_down");
		$el.off("change").on("change",onChangeStandards)
	}
	componentDidMount(){
		const {onChangeStandards } = this.props;
		const $el = $(this.refs.container).find("#std_drop_down");
		$el.off("change").on("change",onChangeStandards)
	}
	render(){
			const props = this.props;
			return(

			        <Modal {...props}>
			           <div className={`${styles.standardsCorrelationsContainer}`} ref="container">
			           		<div dangerouslySetInnerHTML={{__html: props.content}}></div>
			           </div>
			           <LoaderContainer label={`please wait...`} display={props.loader}/>
			        </Modal>	
			)
		
		}
	
	}

StandardsCorrelationsModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
};

export default StandardsCorrelationsModal;