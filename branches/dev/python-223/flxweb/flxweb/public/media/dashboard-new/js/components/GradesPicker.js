import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Checkbox from 'components/common/forms/Checkbox';
import Radio from 'components/common/forms/Radio';
import styles from 'scss/components/GradesPicker';

import grades from 'sources/grades';

import { setUserGrades } from 'actions/userGradesActions';

import { chunk, isEqual, isArray, size} from 'lodash';
import ClickOutside from 'react-onclickoutside';

const GRADES_PER_ROW = 4;

class GradesPicker extends Component {
    constructor(props){
        super(props);
    }

    handleClickOutside(){
        this.props.onClose();
    }

    componentWillUnmount(){
        const { field, setUserGrades } = this.props;

        if(!isEqual(field.initialValue, field.value)){
            setUserGrades(field.value);
        }
    }

    componentWillMount(){
        const { field } = this.props;

        // Ensure field value is an array
        if(field.value && !isArray(field.value)){
            field.value = [parseInt(field.value)];
        }
    }

    render() {
        const {field, isTeacher=false} = this.props;

        const rows = [
            grades.slice(0,1), // i.e. kindergarten
            ...chunk(grades.slice(1), GRADES_PER_ROW)
        ];

        return (
            <div className={`${styles.gradesPicker} row`}>
                <div className={`columns`}>
                    {rows.map((row, i) =>{
                        return <GradesRow key={i} field={field} row={row} isTeacher={isTeacher} />;
                    })}
                </div>
            </div>
        );
    }
}

const GradesRow = ({row, field, isTeacher}) => {
    const rowLength = row.length;

    return (
        <div className={`row collapse`} >
            {row.map((col)=>{
                return <GradesCheckbox key={col.id} field={field} {...col} size={rowLength} isTeacher={isTeacher} />;
            })}
        </div>
    );
};

const GradesCheckbox = ({name, id, field, size, isTeacher}) => {
    const _id   = `${field.name}-${name}-${id}`;
    const _name = name === 'k' ? 'Kindergarten' : name;
    const colSize = 12 / size;

    return (
        <div className={`column small-${colSize}`}>
            { !isTeacher ? <Radio id={_id} value={id} field={field} /> : <Checkbox id={_id} value={id} field={field} /> }
            <label htmlFor={_id}>{_name}</label>
        </div>
    );
};

GradesPicker.propTypes = {
    userGrades: PropTypes.object.isRequired,
    isTeacher: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => {
    return {
        userGrades: state.userGrades
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUserGrades: (grades) => {
            setUserGrades(grades, dispatch);
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ClickOutside(GradesPicker));