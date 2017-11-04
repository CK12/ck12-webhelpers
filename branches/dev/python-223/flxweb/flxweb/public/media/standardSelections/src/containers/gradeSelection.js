import { connect } from 'react-redux';
import Dropdown from '../components/dropdown';
import {selectAGrade, showGradeOptions} from '../actions/actions';


const mapStateToProps = (state) =>{
    return {
        data: {
            ...state.gradeOptions,
            selectedStandard: state.standardOptions.selected.name,
            selectedSubject: state.subjectOptions.selected.name,
            label: 'grade'
        }
    };
};
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onOptionClick: (grade, standard, subject) => {
            if(ownProps.showBooks){
                ownProps.showBooks({
                    subjectName:subject,
                    countryCode:'US',
                    standard: standard,
                    grade: grade.name
                });
            }else{
                let url = '/standards/'+escape(subject)+'/'+escape('US.'+standard)+'/'+escape(grade.name)+'/';
                window.location.href = url;
            }
            dispatch(selectAGrade(grade));
        },
        toggleOptionsVisibility: () => {
            dispatch(showGradeOptions());
        }
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dropdown);
