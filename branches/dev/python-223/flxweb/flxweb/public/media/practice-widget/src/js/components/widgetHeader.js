import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class widgetHeader extends Component{
	constructor(props){
		super(props);
		this.minimizeHandler = props.minimizeHandler;
		this.maximizeHandler = props.maximizeHandler;
		this.state = {
			widgetHeaderClass : props.data.css.widgetHeaderClass
		}
	}
	
	componentWillReceiveProps(props){
		this.setState({
			widgetHeaderClass : props.data.css.widgetHeaderClass
		});
	}
	
	render(){
		return(
			<div>
				<div className={this.state.widgetHeaderClass}>
					<div className="practice-section">
						Practice 
					</div>
					<div className="minimize-section" onClick = {this.minimizeHandler}>
						<i className="icon-minus iconCmn"></i>
					</div>
					<div className="maximize-section" onClick = {this.maximizeHandler}>
						<i className="icon-expand iconCmn"></i>
					</div>
				</div>
			</div>		
		);
	}
}

export default widgetHeader