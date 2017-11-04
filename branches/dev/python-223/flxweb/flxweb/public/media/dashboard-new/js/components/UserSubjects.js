import React, {Component} from 'react';
import {reduxForm} from 'redux-form';
import { chunk } from 'lodash';

import SubjectsPicker from 'components/SubjectsPicker';

import { capitalizeWords } from 'utils/formatting';
import styles from 'scss/components/UserSubjects';

const MAX_SUBJECTS_SHOWN = 8;

const getSubjectBrowseUrl = (subject)=>{
    return `/${subject.replace(/\s/g, '-')}`.toLowerCase();
};
const BROWSE          = 'Browse';
const BROWSE_PAGE_URL = `/${BROWSE}`.toLowerCase();

class UserSubjects extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { fields: { userSubjects }, onClick }  = this.props;

        const subjects          = userSubjects.value.map(capitalizeWords);
        let subjectColumns      = chunk( subjects.slice(0, MAX_SUBJECTS_SHOWN), MAX_SUBJECTS_SHOWN / 2);
        const colWidth          = 12 / subjectColumns.length;
        const hasColumns        = !!subjectColumns.length;
        const hasHiddenSubjects = subjects.length > MAX_SUBJECTS_SHOWN;


        if(hasHiddenSubjects || !hasColumns){
            if(subjectColumns.length === 2){
                // Change second column to have a 'view all' link
                subjectColumns[1] = [...subjectColumns[1].slice(0, 3), BROWSE];
            }
        }

        return (
            <div className={`${styles.userSubject} row`}>
                <div className={`${styles.title} column small-12`}>
                    <div className={`row align-stretch collapse`}>
                        <div className={`column shrink ${styles.subjectsTitle} dxtrack-user-action`} data-dx-desc={`Toggle subjects picker`} >
                            <i className="dashboard-icon-edit"></i>Subjects
                            { hasColumns ? <span onClick={onClick}>Edit</span> : null }
                        </div>
                    </div>
                </div>

                {hasColumns ?
                    subjectColumns.map( (column, i) => <SubjectColumn key={i} column={column} colWidth={colWidth} /> )
                    : <NoSubjects onClick={onClick} />
                }
            </div>
        );
    }
}

const NoSubjects = ({onClick}) => {
    return (
        <span className={`${styles.noSubjects} column shrink`} onClick={onClick}>Add subjects</span>
    );
};


const SubjectColumn = ({column, colWidth}) => {
    return (
        <ul className={`${styles.subjects} column small-${colWidth}`}>
            {column.map( subject =>{
                const url = getSubjectBrowseUrl(subject);
                const viewAllClass = url === BROWSE_PAGE_URL ? styles.viewAllSubjects : '';
                const _url = (url === BROWSE_PAGE_URL) ? url : '/c' + url;

                return (
                    <li key={subject} className={viewAllClass}>
                        <a href={_url} className={`dxtrack-user-action`} data-dx-desc={`Go to ${subject} (browse)`}>{subject === BROWSE ? 'view all' : subject}</a>
                    </li>
                );
            })}
        </ul>
    );
};


const mapStateToProps = (_state) => {
    const userSubjects = _state.userSubjects.subjects.map( subject => capitalizeWords(subject.name) );

    return {
        initialValues: {
            userSubjects
        }
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default reduxForm({
    form: 'updateUserSubjects',
    fields: ['userSubjects']
},
mapStateToProps,
mapDispatchToProps
)(UserSubjects);