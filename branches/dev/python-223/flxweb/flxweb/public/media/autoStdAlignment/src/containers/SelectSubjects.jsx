import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';

import { subjectsConfig } from '../app/Config';

import {
    Actions,
    ActionMethods
} from '../actions/'

const {
    SubSelectionCompInit,
    SubSelectionCheckChanged,
    SubSelectionProceedForward
        } = ActionMethods; // destructuring the methods required to send
// Components
import AlignedCheckBox from '../components/AlignedCheckBox'

import NextButton from '../components/NextButton.jsx';

import BreadCrumb  from '../components/BreadCrumbContainer.jsx';

class SelectSubjects extends Component {

  constructor(props) {
    super(props);
    this.onCheckBoxEvent = this.onCheckBoxEvent.bind(this);
    this.moveForward =  this.moveForward.bind(this);
  }
  componentWillMount(){
    const { action } = this.props;
    action.SubSelectionCompInit();
  }
  //TODO : Clean Up after check
  createSubjectList(subjectList, subject){
    const { selectedSubjects } = this.props;

    return subjectList.map((branch, idx)=>{

          const checBoxProps = {
            isSelected : selectedSubjects.includes(branch.code),
            handleCheckBoxChange : this.onCheckBoxEvent.bind(this,subject.code, branch.code)
          };


          return <div key={idx}>
                      <AlignedCheckBox {...checBoxProps} />
                      <label style={{ display: 'inline-block'}}>
                        <a id={`browse-${branch.name}`} className="subject-link" title={`${branch.title}`}
                          style={Styles.anchorStyle}>
                            <span className="subject-icon" style={{
                              ...Styles['checkBoxOverridingStyle'],
                              ...Styles['checkBoxIconStyle']
                            }}>
                              <span className={`${branch.name}`} style={Styles.subjIcon}></span>
                            </span>
                            <span className="browse-title" style={{
                              ...Styles['checkBoxOverridingStyle'],
                              ...Styles['checkboxTitleStyle']
                            }}>{branch.title}</span>
                        </a>
                      </label>
                  </div>
    })
  }
  render() {
    const { selectedSubjects } = this.props;
    const shouldNextBtnBeDisabled =  selectedSubjects.length == 0 ;
    const mathSubjects =  [...subjectsConfig[0].branchList];
    const mathListOne =   mathSubjects.splice(0, 6);
    const mathListTwo =  mathSubjects;
    const scienceList =  subjectsConfig[1].branchList;

    const mathsOneContent  =  this.createSubjectList(mathListOne, subjectsConfig[0]);
    const mathsTwoContent  =  this.createSubjectList(mathListTwo, subjectsConfig[0]);
    const scienceContent   =  this.createSubjectList(scienceList, subjectsConfig[1]);


    const btnProps =  {
      isDisabled : shouldNextBtnBeDisabled,
      handleClickEvent : this.moveForward,
      text : 'Next \u003E \u003E'
    }

    return (
            <div>
              <BreadCrumb />
                <div style={Styles.SubjectHeader}>
                  Select Subjects
                </div>
                <div style={Styles.SubjectSelectorArea} >
                  <div style={Styles.subjectContainer}>
                    <div style={Styles.mathContainerStyle}>
                      <div style={Styles.mathOverlay}>
                          <div style={Styles.mathOverlayContent}>
                              <span style={Styles.mathTxt}>Math</span>
                              <span style={Styles.comingSoonTxt}>Coming Soon</span>
                              <a className='aligned-standard-text'> Browse Math Concepts &#x3e;</a>
                          </div>
                      </div>
                      <div style={Styles.title}>
                        <h3>Maths</h3>
                      </div>
                      <div style={Styles.mathRowStyle}>{mathsOneContent}</div>
                      <div style={Styles.mathRowStyle} >{mathsTwoContent}</div>
                    </div>
                  <div style={Styles.sciContainerStyle}>
                      <div style={Styles.title}>
                        <h3>Science</h3>
                      </div>
                      <div >{scienceContent}</div>
                  </div>
                  </div>
                </div>
                <div style={Styles.btnContainer}>
                  <NextButton {...btnProps} />
                </div>
            </div>
        )
  }

  onCheckBoxEvent(subject, branch) {
    const { action } = this.props;
    action.SubSelectionCheckChanged({
        subject,
        branch
    });
  }
  moveForward(){
    const { action } = this.props;
    action.SubSelectionProceedForward();
  }
}

let mapStateToProps = (state, ownProps)=> {
  return state;
};

let mapDispatchToProps = (dispatch, ownProps)=> {
  return {
    action: bindActionCreators({
      SubSelectionCompInit,
      SubSelectionCheckChanged,
      SubSelectionProceedForward
    }, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectSubjects);

const Styles =  {
  SubjectHeader : {
    overflowWrap :'normal',
    height: '60px',
    fontSize: '40px',
    textAlign : 'center'
  },
  SubjectSelectorArea : {
      width : '100%',
      height : '400px',
      marginLeft : 'auto',
      marginRight : 'auto'
  },
  anchorStyle: {
    width: '100%',
    padding: '6px 20px 1px',
    margin: '10px 0'
  },
  btnContainer:{
    marginTop : '15px'
  },
  subjIcon:{
    width : '48px',
    height: '48px'
  },
  checkBoxOverridingStyle:{
    display: "inline-block",
    width: "80px",
    overflow: "hidden"
  },
  checkBoxIconStyle:{
      width : '58px',
      height: '48px'
  },
  checkboxTitleStyle:{
      'fontSize': '16px'
  },
  mathOverlay:{
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    height: '100%',
    opacity: '0.75'
  },
  mathOverlayContent:{
      top : '40%',
      position : 'relative',
      userSelect : 'none'
  },
  mathTxt:{
    fontSize : '24px',
    fontWeight : 700,
    display : 'block'
  },
  comingSoonTxt:{
    fontSize : '27px',
    fontWeight : 500,
    display : 'block'
  },
  title:{
    textAlign : 'left',
    paddingLeft : '15px'
  },
  subjectContainer:{
    display: 'table'
  },
  mathContainerStyle:{
    display : 'table-cell',
    width : '66%',
    paddingLeft : '75px',
    position : 'relative'
  },
  sciContainerStyle:{
    display : 'table-cell',
    width : '33%',
    paddingLeft : '75px'
  },
  mathRowStyle :{
    width : '50%',
    display: 'table-cell'
  }
}
