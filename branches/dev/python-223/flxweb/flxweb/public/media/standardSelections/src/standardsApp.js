import React from 'react';
import {connect} from 'react-redux';
import StandardSelection from './containers/standardSelection';
import SubjectSelection from './containers/subjectSelection';
import GradeSelection from './containers/gradeSelection';
import {
    loadStandardsData,
    fetchUser,
    hideAllOptions
} from './actions/actions';

class StandardsApp extends React.Component {
    constructor() {
        super();
    }
    componentDidMount(){
        this.props.loadStandardsData(this.props.initData);
        this.props.fetchUser();
    }
    render(){
        return (
            <div className="row">
                <StandardSelection />
                <SubjectSelection />
                <GradeSelection backboneRouter={this.props.backboneRouter} showBooks={this.props.showBooks}/>
                <div style={styles.mask} className={this.props.showMask? '': 'hide'} onClick={()=>this.props.hideAllOptions()}></div>
            </div>
        );
    }
}
const styles = {
    mask:{
        position: 'fixed',
        top: '0',
        left:'0',
        width: '100%',
        height: '100%',
        zIndex: '20'
    }
};
const mapStateToProps = (state) =>{
    let {standardOptions, subjectOptions, gradeOptions} = state;
    if(standardOptions.showOptions || subjectOptions.showOptions || gradeOptions.showOptions){
        return{
            showMask: true
        };
    }
    return {
        showMask: false
    };
};
export default connect(
    mapStateToProps,
    {
        loadStandardsData,
        fetchUser,
        hideAllOptions
    }
)(StandardsApp);
