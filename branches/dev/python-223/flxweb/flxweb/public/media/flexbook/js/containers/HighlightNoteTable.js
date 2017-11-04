import React from 'react';
import {connect} from 'react-redux';
import {isUserLoggedIn} from '../selectors/selectors.js';
import {requireModule,showSigninDialog} from '../utils/requireBridge';
import {
  ANNOTATION_ADDED,
  ANNOTATION_REMOVED,
  ANNOTATION_UPDATED,
  ANNOTATION_LOADMORE

} from '../actions/actionTypes';
class HighlightNoteTable extends React.Component{
  renderTableContent(){
    let {loggedIn,annotationList:{annotations, pageNum}} = this.props;
    let $ = window.$;
    if(annotations.length > 0){
      return (
        <tbody>
          {annotations.map(annotation =>(
            <tr key={annotation.id}>
              <td>
                <span className={'circle '+annotation.highlightColor}>
                </span>
              </td>
              <td>
                {annotation.quote}
              </td>
              <td>
                {annotation.text || ''}
              </td>
              <td>
                <span
                  className="delete-btn-container"
                  onClick={()=>{
                    this.props.removeAnnotation(annotation);
                    $('#artifact_content').data('annotator').deleteAnnotation(annotation);
                  }}>
                  <i className="icon-delete_cc delete-annotation-bt">
                  </i>
                </span>
              </td>
            </tr>
          ))}
          <tr
            onClick={()=> this.props.loadMoreAnnotations()}
            className={annotations.length < pageNum*5? 'hide': ''}>
            <td colSpan="4" id="notes-pagination">
              Show More <i className="icon-arrow3-down">
            </i>
          </td>
        </tr>
      </tbody>
      );
    }
    return (
    <tbody className='highlightnotetable'>
      <tr className="no-annotation-message ">
        <td>
          <span className="circle disable-circle">
          </span>
        </td>
        <td colSpan="3">
          {loggedIn?
            'Highlight or Annotate any text from above, and it will appear here.'
            :(<span>Please <a onClick={()=>this.props.showSigninDialog()}>Sign In</a> to create your own Highlights / Notes</span>)
          }
        </td>
      </tr>
    </tbody>
    );
  }
  componentDidMount(){
  //TODO: need a better way to bind these events
    requireModule('jquery').then(($)=>{
      $(document).off('createdNewAnnotation').on('createdNewAnnotation', (e, annotation) => {
        this.props.addAnnotation(annotation);
      });
      $(document).off('deletedAnnotation').on('deletedAnnotation', (e,annotation) => {
        this.props.removeAnnotation(annotation);
      });
      $(document).off('updateAnnotation').on('updateAnnotation', (e, annotation) =>{
        this.props.updateAnnotation(annotation);
      });
    });
  }
  render(){
    return(
    <section
      data-magellan-destination="myAnnotations"
      className="myAnnotations-container">
      <h3 style={styles.sectionTitle}>
        Notes/Highlights
        <span style={styles.reportLink}>
          Having trouble? <a href="mailto:support@ck12.org?subject=Having trouble with annotations&amp;body=&lt;Please provide some details about the issue you are experiencing with annotations&gt;%0D%0A%0D%0A--- Technical Details ---%0D%0APage:https://www.ck12.org/book/CK-12-Middle-School-Math-Concepts-Grade-7/section/1.1/%0D%0AID:971372%0D%0ABrowser:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36%0D%0A%0D%0A" target="_blank">Report an issue.</a>
      </span>
    </h3>
    <table>
      <thead>
        <tr>
          <th>Color</th>
          <th>
            Highlighted Text
          </th>
          <th>Notes</th>
          <th>
          </th>
        </tr>
      </thead>
      {this.renderTableContent()}
    </table>
  </section>
    );
  }
}
const styles = {
  sectionTitle:{
    borderTop: '1px solid #e6e6e6',
    paddingTop: '15px',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  reportLink:{
    float: 'right',
    fontSize: '14px',
    color: '#56544D',
    paddingTop: '1px'
  }
};
const mapStateToProps = (state) =>{
  let pageSize = 5;
  let {loggedIn} = isUserLoggedIn(state);
  let annotationList = state.annotationList;
  return {
    loggedIn,
    annotationList: {
      ...annotationList,
      annotations: annotationList.annotations.slice(0,annotationList.pageNum*pageSize)
    }
  };
};
const mapDispatchToProps = (dispatch) =>{
  return {
    showSigninDialog,
    addAnnotation: (annotation) =>{
      dispatch({
        type: ANNOTATION_ADDED,
        annotation
      });
    },
    removeAnnotation: (annotation) => {
      dispatch({
        type: ANNOTATION_REMOVED,
        annotation
      });
    },
    updateAnnotation: (annotation) =>{
      dispatch({
        type: ANNOTATION_UPDATED,
        annotation
      });
    },
    loadMoreAnnotations: () =>{
      dispatch({
        type: ANNOTATION_LOADMORE
      });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HighlightNoteTable);
