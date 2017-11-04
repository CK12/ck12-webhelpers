import React from 'react';
import Modal from 'react-modal';
import {SUBJECT, SCHOOL, COLLEGE, NO_OF_STUDENTS} from '../constants/placeholders';

const ALL_GRADES = '1,2,3,4,5,6,7,8,9,10,11,12,College'.split(',');

class PDFInfoModal extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      grades: ALL_GRADES.reduce((memo, grade)=>{
        memo[`grade_${grade}`] = false;
        return memo;
      },{}),
      subjects: '',
      school : '',
      schoolType: '',
      noOfUsers: ''
    }
    this.handleGradeChange = this.handleGradeChange.bind(this);
    this.handleSubjectChange = this.handleSubjectChange.bind(this);
    this.handleStudentCountChange = this.handleStudentCountChange.bind(this);
    this.handleSchoolChange = this.handleSchoolChange.bind(this);
    this.handleSchoolTypeChange = this.handleSchoolTypeChange.bind(this);
    this.handleCollegeChange = this.handleCollegeChange.bind(this);
    this.submitInfo = this.submitInfo.bind(this);
  }

  handleSchoolChange(e){
    this.setState({
      schoolType:'school',
      school: e.target.value
    })
  }

  handleSchoolTypeChange(e){
    let school = '';
    let schoolType = e.target.value || '';
    if (schoolType === 'homeschool'){
      school = 'homeschool'
    }
    this.setState({
      schoolType,
      school
    })
  }

  handleCollegeChange(e){
    let val = e.target.value || '';
    this.setState({
      schoolType:'college',
      'school': val?`college-${val}`:''
    });
  }

  handleGradeChange(e){
    let grades = {...this.state.grades};
    grades[`grade_${e.target.value}`] = e.target.checked?e.target.value:false;
    this.setState({grades})
  }

  handleSubjectChange(e){
    this.setState({subjects:e.target.value})
  }

  handleStudentCountChange(e){
    let noOfUsers = parseInt(e.target.value)||'';
    this.setState({noOfUsers})
  }

  getSchoolName(){
    let {schoolType, school} = this.state;
    return (schoolType === 'school')?school:'';
  }

  getCollegeName(){
    let {schoolType, school} = this.state;
    return (schoolType === 'college')?school.replace('college-',''):'';
  }
  
  renderGradeBoxes(){
    let grades = this.state.grades;
    return ALL_GRADES.map((grade)=>{
      return (<span style={styles.label} key={`grade_${grade}`}>
        <label>
          <input 
            type='checkbox' 
            value={grade} name='grade' 
            onChange={this.handleGradeChange} 
            checked={grades[`grade_${grade}`]}
            /> {grade}
        </label>
      </span>);
    });
  }
  renderGradesRow(){
    return (
      <div className="row" style={styles.row}>
        <div className='large-3 columns' style={styles.rowLabel}>
          Grade(s) used for:
        </div>
        <div className='large-9 columns'>
          { this.renderGradeBoxes() }
        </div>
      </div>
    );
  }
  renderSubjectsRow(){
    return (
      <div className="row" style={styles.row}>
        <div className='large-3 columns' style={styles.rowLabel}>
          Subject(s) used for:
        </div>
        <div className='large-9 columns'>
          <input placeholder={SUBJECT} type="text" value={this.state.subjects} onChange={this.handleSubjectChange} />
        </div>
      </div>
    );
  }
  renderSchoolRow(){
    return(
      <div className="row" style={styles.row}>
      <div className='large-3 columns' style={styles.rowLabel}>
        School:
      </div>
      <div className='large-9 columns'>
        <label><input type="radio" checked={this.state.schoolType==='school'} name="schools-radio" value="school" onChange={this.handleSchoolTypeChange} /> Enter the name of your school</label>
        <div>
          <input placeholder={SCHOOL} type='text' value={this.getSchoolName()} onChange={this.handleSchoolChange} />
        </div>
        <label><input type="radio" checked={this.state.schoolType==='homeschool'} name="schools-radio" value="homeschool" onChange={this.handleSchoolTypeChange}/> I attend a homeschool.</label>
        <label><input type="radio" checked={this.state.schoolType==='college'} name="schools-radio" value="college" onChange={this.handleSchoolTypeChange}/> College</label>
        <div>
          <input placeholder={COLLEGE} type='text' value={this.getCollegeName()} onChange={this.handleCollegeChange} />
        </div>
      </div>
    </div>
    );
  }

  renderStudentCountRow(){
    return (<div className="row" style={styles.row}>
      <div className='large-3 columns' style={styles.rowLabel}>
        # of students sharing with:
      </div>
      <div className='large-9 columns'>
        <input placeholder={NO_OF_STUDENTS} type="text" value={this.state.noOfUsers} onChange={this.handleStudentCountChange} />
      </div>
    </div>);
  }

  isGradeSelected(){
    return !!Object.values(this.state.grades).find((e)=>!!e)
  }

  isDownloadEnabled(){
    let {subjects, noOfUsers, school} = this.state;
    return !!(this.isGradeSelected() && subjects.trim() && school.trim() && noOfUsers)
  }

  submitInfo(){
    if (this.isDownloadEnabled() && 'function' === typeof this.props.onSubmit ){
      let {grades, school, subjects, noOfUsers} = this.state;
      grades = Object.values(grades).filter((e)=>e).join(',');
      subjects = subjects.trim();
      school = school.trim();
      this.props.onSubmit({
        grades,
        subjects,
        school,
        noOfUsers
      })
    }
  }

  close(){
    if( 'function' === typeof  this.props.onClose ){
      this.props.onClose(false);
    }
  }

  render(){
    let {submitInfo} = this;
    return (
      <div>
        <Modal
          contentLabel='PDFInfo-Modal'
          isOpen={true}
          style={customStyles}
        >
          <form style={styles.form}>
            <div style={styles.closeBtn} className='icon-close' onClick={()=>this.close()}></div>
            <div style={styles.header}>Download FlexBook&reg;</div>
            <div style={styles.subtext}>
              Help make CK-12 a better product by answering a few questions below:
            </div>
            {this.renderGradesRow()}
            {this.renderSubjectsRow()}
            {this.renderSchoolRow()}
            {this.renderStudentCountRow()}
            <div style={styles.downloadBtnContainer}>
              <a href="#" onClick={submitInfo} style={{color:'white', cursor: 'pointer'}}
              className={`button turquoise large ${this.isDownloadEnabled()?'':'grey disabled'}`}> 
                Download 
              </a>
            </div>
          </form>
        </Modal>
      </div>
    ); 
  }
}

const customStyles = {
  overlay : {
    top: '0px',
    bottom: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(204, 204, 204,0.6)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  content : {
    textAlign: 'center',
    width: '670px',
    color: '#000',
    border: '2px solid #ccc',
    borderRadius: '5px',
    marginTop: '190.5px',
    margin: 'auto',
    maxWidth: '93%',
    maxHeight: '97%',
    minWidth: '270px',
    minHeight: '75px',
    background: '#fff',
    position: 'relative',
    top: '0px',
    overflow: 'visible',
    left: '0px',
    right: '0px'
  }
};

const styles={
  label: {
    display:'inline-block',
    width:'65px',
    textAlign:'left',
    fontWeight:'bold'
  },
  form:{
    textAlign: 'left'
  },
  row:{
    marginBottom: '10px'
  },
  rowLabel: {
    textAlign: 'right',
    fontWeight: 'bold'
  },
  header: {
    color: '#56544D',
    fontWeight:'bold',
    fontSize: '28px',
    marginBottom: '12px',
    textAlign:'center'
  },
  subtext: {
    color: '#56544D',
    paddingBottom: '20px',
    textAlign:'center'
  },
  downloadBtnContainer: {
    textAlign:'center'
  },
  closeBtn:{
    cursor: 'pointer',
    position: 'absolute',
    top: '15px',
    right: '15px'
  }
};

export default PDFInfoModal;