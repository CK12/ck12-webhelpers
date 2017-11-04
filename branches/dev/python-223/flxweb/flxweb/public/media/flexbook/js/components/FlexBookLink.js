import React from 'react';
import {connect} from 'react-redux';
import {bookLocationInfoToURL} from '../utils/utils.js';
import {getLastSubject, getSectionDomain, userHasRole, isLatestBook} from '../selectors/selectors';
import * as constants from '../constants/constants';
class FlexBookLink extends React.Component {
  constructor(){
    super();
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    if (this.props.onClick){
      e.preventDefault();
      this.props.onClick(this.props.section);
    }
  }
  render(){
    let props = this.props;
    let directURL = props.directURL;
    let url = (!directURL) ? bookLocationInfoToURL(props) : directURL;

    return (
      <a
        href={url}
        className={`${props.className} flexbooklink`}
        style={props.style}
        title={props.title || ''}
        onClick={this.onClick.bind(this)}
        target= {props.target || '_self'}
        >
        {props.children}
      </a>
    );
  }
}

FlexBookLink.propTypes = {
  realm: React.PropTypes.string, //TODO: create custom propType
  revision: React.PropTypes.string,
  section: React.PropTypes.string, //TODO: create custom propType
  onClick: React.PropTypes.func,
  title: React.PropTypes.string
};

const mapStateToProps = (state) => {
  return {
    domain: getSectionDomain(state),
    subject: getLastSubject(state),
    isTeacher: userHasRole(state,constants.TEACHER),
    isLatest : isLatestBook(state)
  };
};

export default connect(
  mapStateToProps,
  null
)(FlexBookLink);
