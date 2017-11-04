import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import WidgetHeader from './components/widgetHeader';
import WidgetContainer from './components/widgetContainer';
import WidgetActions from './actions/PracticeWidgetModeActions';
import WidgetStore from './store/PracticeWidgetStore';

class Ck12PracticeWidget extends Component {
	
	constructor(props){
		super(props);
		this.state = {
			data : WidgetStore.getAllData(),
			iframeURL : props.iframeURL
		}
	}
	
	renderMinimizeMode(){
		console.log("minimize handler...");
		this.props.onMinimize();
	}
	
	renderNormalMode(){
		console.log("normal handler...");
		this.props.onNormalize();
		WidgetActions.normalMode();
	}
	
	renderMaximizeMode(){
		console.log("maximize handler...");
		this.props.onMaximize();
		WidgetActions.maxMode();
	}
	
	componentWillReceiveProps(props){
		this.setState({
			iframeURL : props.iframeURL,
		});
	}
	
	componentWillMount(){
		WidgetStore.on("change", () => {
			this.setState({
				data: WidgetStore.getAllData()
			});
		});
	}
	
    render(){
        return (
          <div /*className ={`sticky-widget`} */>
          	 <WidgetHeader data = {this.state.data} minimizeHandler = {this.renderMinimizeMode.bind(this)} maximizeHandler = {this.renderMaximizeMode.bind(this)} />	
          	 <WidgetContainer data = {this.state.data} practiceURL = {this.state.iframeURL} normalHandler = {this.renderNormalMode.bind(this)} />                        
          </div>
       );
    }
}


export default Ck12PracticeWidget
