import React, {Component} from 'react';
import StandardsBoards from './StandardsBoards';
import { getSelectedStandard} from '../selectors/selectors.js';
import {connect} from 'react-redux';
import {showStandards} from '../actions/actions';

class StandardsGrid extends Component{
  componentWillReceiveProps(newProps){
    if(newProps.standards != this.props.standards)
      this.forceUpdate();
  }
  render(){
    return (
      <div className='standardsgrid'>
        <StandardsBoards selectedStandard={this.props.selectedStandard}/>
      </div>
    );
  }

}

const mapStateToProps = (state) => {
  let selectedStandard = getSelectedStandard(state);
  return {
    selectedStandard
  };
};

export default connect(
  mapStateToProps,
  {showStandards}
)(StandardsGrid);
