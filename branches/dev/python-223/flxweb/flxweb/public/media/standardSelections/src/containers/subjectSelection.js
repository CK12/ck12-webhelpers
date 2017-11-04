import { connect } from 'react-redux';
import Dropdown from '../components/dropdown';
import {selectASubject, showSubjectOptions} from '../actions/actions';


const mapStateToProps = (state) =>{
    return {
        data: {
            ...state.subjectOptions,
            label: 'subject'

        }
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        onOptionClick: (subject) => {
            dispatch(selectASubject(subject));
        },
        toggleOptionsVisibility: () => {
            dispatch(showSubjectOptions());
        }
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dropdown);
