import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class widgetContainer extends Component{
	constructor(props){
		super(props);
		this.state = {
			practiceURL : props.practiceURL,
			modalClass : props.data.css.modalClass,
			modalBackClass : props.data.css.modalBackClass,
			modalIframeClass : props.data.css.modalIframeClass,
			closeBtn : props.data.css.closeBtn,
			resetNormalMode : props.normalHandler
		}	
	}
	
	componentWillReceiveProps(props){
		this.setState({
			practiceURL : props.practiceURL,
			modalClass : props.data.css.modalClass,
			modalBackClass : props.data.css.modalBackClass,
			modalIframeClass : props.data.css.modalIframeClass,
			closeBtn : props.data.css.closeBtn
		});
	}
	
	render(){
		return(
			<div>
				<div className={this.state.modalClass}>
				   <iframe src={this.state.practiceURL} className={this.state.modalIframeClass} />
				   <div className={this.state.closeBtn} onClick = {this.state.resetNormalMode}><div className = "contract-section"><i className="icon-contract iconCon"></i></div>
				   		
				   </div>
				</div>
				<div className={this.state.modalBackClass}>
				 	
				</div>
			</div>				
		);
	}
}

export default widgetContainer;