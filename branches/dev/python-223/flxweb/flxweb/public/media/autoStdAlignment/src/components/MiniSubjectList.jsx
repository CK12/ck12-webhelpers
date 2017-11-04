import React, { Component } from 'react';

class MiniSubjectList extends Component {
  render() {
    const {
          subjectList,
          handleEditSubjectList
        } = this.props;

    const subjectDetails =  subjectList.join(', ');

    return (
      <div style={{'marginTop': '5px', 'marginBottom': '5px'}}>
        <span style={{'fontWeight':'bold'}}>Subjects : </span>
        {subjectDetails}
        <i className='icon-edit' style={{'color': '#0086C3', marginLeft:'6px'}} onClick={handleEditSubjectList}></i>
      </div>
        )
  }
  shouldComponentUpdate( nextProps, nextState){
    return  nextProps.subjectList.join(', ') != this.props.subjectList.join(', ');
  }
}

export default MiniSubjectList;

MiniSubjectList.defaultProps = {
  subjectList : [],
  handleEditSubjectList:()=>{}
};

const Styles = {

}
