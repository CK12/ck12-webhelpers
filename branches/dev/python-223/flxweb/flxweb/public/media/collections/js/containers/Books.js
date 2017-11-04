import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import FlexBook from '../components/Flexbook';
import {getFlexbookInfo} from '../actions/actions';
import {isFlexbookLoaded, getFlexbooks} from '../selectors/selectors';

export const intersect = function(arr1, arr2) {
  var temp = [];
  for(var i = 0; i < arr1.length; i++){
    for(var k = 0; k < arr2.length; k++){
      if(arr1[i] == arr2[k]){
        temp.push( arr1[i]);
        break;
      }
    }
  }
  return temp;
};

class FlexbookContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var props = this.props;
    var flexbooksData = props.books;
    
    if (props.level == 'levelBasic') flexbooksData = props.levelBasic;
    else if (props.level == 'levelAtGrade') flexbooksData = props.levelAtGrade;
    else if (props.level == 'levelAdvanced') flexbooksData = props.levelAdvanced;

    if (props.grade == 'middleSchool') flexbooksData = intersect(flexbooksData, props.middleSchool);
    if (props.grade == 'highSchool') flexbooksData = intersect(flexbooksData, props.highSchool);

    //[Bug 56710] hide CBSE books when not applicable.
    if (!props.showCBSE){
      flexbooksData = flexbooksData.filter((book) => {
        return !(book.tagGrid || []).find((tag)=> tag.indexOf('cbse') !== -1);
      });
    }

    var flexbooksNonSpanishData = intersect(flexbooksData, props.languageEnglish);
    var flexbooksSpanishData = intersect(flexbooksData, props.languageSpanish);

    const NonSpanishFlexbooks = flexbooksNonSpanishData.map((book) =>
        <FlexBook
            isTeacher = {this.props.isTeacher}
            key = {book.artifactID}
            title = {book.title}
            coverImage = {(('coverImageSatelliteUrl' in book) ? book.coverImageSatelliteUrl.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_LARGE_TINY') : '/media/images/thumb_dflt_flexbook_lg.png')}
            perma={book.perma}
            extendedArtifacts={book.extendedArtifacts} />
    );

    const SpanishFlexbooks = flexbooksSpanishData.map((book) =>
        <FlexBook
            isTeacher = {this.props.isTeacher}
            key = {book.artifactID}
            title = {book.title}
            coverImage = {(('coverImageSatelliteUrl' in book) ? book.coverImageSatelliteUrl.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_LARGE_TINY') : '/media/images/thumb_dflt_flexbook_lg.png')}
            perma={book.perma}
            extendedArtifacts={book.extendedArtifacts} />
    );

    return (
        <div id="view_browse">
            <div id="no-flexbooks" className="hide text-center">Sorry, there are no FlexBook® Textbooks for this selection.</div>
            {(props.language == 'all' || props.language == 'languageEnglish') &&
                <div className="row collapse non-spanish-books-wrapper">
                    {NonSpanishFlexbooks}
                </div>
            }
            {(props.language == 'all' || props.language == 'languageSpanish') &&
                <div className="row collapse spanish-books-wrapper">
                    {(props.language == 'all' && flexbooksSpanishData.length > 0) &&
                        <div className="js-spanish-heading-wrapper">
                            <div className="spanish-heading">Spanish Books</div>
                        </div>
                    }
                    {SpanishFlexbooks}
                </div>
            }
            {((props.language == 'all' && flexbooksData.length == 0) ||
              (props.language == 'languageEnglish' && flexbooksNonSpanishData.length == 0) ||
              (props.language == 'languageSpanish' && flexbooksSpanishData.length == 0)) &&
               <center style={{paddingBottom:'20px'}}>Sorry, there are no FlexBook® Textbooks for this selection.</center>
            }
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    books: getFlexbooks(state),
    languageSpanish: getFlexbooks(state, 'languageSpanish'),
    languageEnglish: getFlexbooks(state, 'languageEnglish'),
    levelBasic: getFlexbooks(state, 'levelBasic'),
    levelAdvanced: getFlexbooks(state, 'levelAdvanced'),
    levelAtGrade: getFlexbooks(state, 'levelAtGrade'),
    middleSchool: getFlexbooks(state, 'middleSchool'),
    highSchool: getFlexbooks(state, 'highSchool'),
    showLanguages:  getFlexbooks(state, 'showLanguages'),
    showLevels:  getFlexbooks(state, 'showLevels'),
    showSchoolTabs:  getFlexbooks(state, 'showSchoolTabs'),
  };
};

export default connect(
    mapStateToProps
)(FlexbookContainer);
