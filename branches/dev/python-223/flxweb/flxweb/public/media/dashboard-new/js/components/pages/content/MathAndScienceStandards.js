import React, {
    Component
} from 'react';
import {
    find,
    findIndex,
    isNil
} from 'lodash';

import styles from 'scss/components/MathAndScienceStandards';
import {
    connect
} from 'react-redux';

import DropDown from 'components/common/DropDown';
import {showModal} from 'actions/modalActions';

import BooksContainer from './BooksContainer';
import routes from 'routes';
import * as contentActions from 'actions/contentPageActions';

class MathAndScienceStandards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dropDowns: {
                'standards': {
                    data: 'standardsData',
                    selected: 'selectedStandard',
                    name: 'State or standard set',
                    enable: 'standardsEnable',
                    isOptGroup: true,
                    onChange: this.onChangeOfStandards.bind(this)
                },
                'subjects': {
                    data: 'subjectsData',
                    selected: 'selectedSubject',
                    name: 'Subjects',
                    enable: 'subjectsEnable',
                    isOptGroup: false,
                    onChange: this.onChangeOfSubjects.bind(this)
                },
                'grades': {
                    data: 'gradesData',
                    selected: 'selectedGrade',
                    name: 'Grades',
                    enable: 'gradesEnable',
                    isOptGroup: false,
                    onChange: this.onChangeOfGrades.bind(this)
                }
            },
            booksContainerDisplay: (this.props.standards.booksData ? true : false),
            booksContainerLoaderDisplay: false

        };

        this.onChangeOfStandards = this.onChangeOfStandards.bind(this);
        this.onChangeOfSubjects = this.onChangeOfSubjects.bind(this);
        this.onChangeOfGrades = this.onChangeOfGrades.bind(this);
        this.afterBookDataSuccess = this.afterBookDataSuccess.bind(this);
        this.onClickOnStandard = this.onClickOnStandard.bind(this);
        this.onChangeStandards = this.onChangeStandards.bind(this);
        this.afterStandardsCorrelationSuccess = this.afterStandardsCorrelationSuccess.bind(this);
        this.showBooks = this.showBooks.bind(this);

    }
    componentDidUpdate() {
        const {
            location: {query},
            standards
        } = this.props;

        if (query.standard && standards.selectedStandardIndex === '') {
            this.checkParams();
        }
        if (standards.selectedGradeIndex !== '' && standards.booksData === '' && !this.state.booksContainerLoaderDisplay) {
            this.callServiceToGetBooksData(standards.selectedGradeIndex);
        }
    }
    componentDidMount(){
        let initailizedData = {};
        let dataFromURL = this.props.location.query;
        if(Object.keys(dataFromURL).length > 0){
            initailizedData = dataFromURL;
        }else{
            let storedData = this.getDataResponse();
            if(storedData.selectedStandard.length > 0 && storedData.selectedSubject.length > 0 && storedData.selectedGrade.length > 0){
                initailizedData.standard = storedData.selectedStandard;
                initailizedData.subject = storedData.selectedSubject;
                initailizedData.grade = storedData.selectedGrade;
            }
        }
        window.StandardSelections.init({id:'standardsApp', callback: this.showBooks, initailizedData});
    }
    showBooks(bookInfo){
        this.props.getBooksData(bookInfo, this.afterBookDataSuccess);

        this.setState(Object.assign({}, this.state, {
            booksContainerDisplay: true,
            booksContainerLoaderDisplay: true
        }));

        this.props.history.replace({
            pathname: routes.contentPage.standards,
            query: {
                standard: bookInfo.standard,
                subject: bookInfo.subjectName,
                grade: bookInfo.grade

            }
        });
        this.checkParams();
    }
    checkParams() {
        const {
            location: {query},
            standards
        } = this.props;

        let standardsIndex = '',
            subjectIndex = '',
            gradeIndex = '',
            standardsLength = standards.standards.length;

        if (standardsLength && !isNil(query.standard)) {
            standardsIndex = findIndex(standards.standards, function(o) {
                return o.name == query.standard;
            });
            standardsIndex = standardsIndex === -1 ? '' : standardsIndex;
        }

        if (standardsLength && !isNil(query.subject) && standardsIndex) {
            subjectIndex = findIndex(standards.standards[standardsIndex]['subjects'], function(o) {
                return o.name == query.subject;
            });
            subjectIndex = subjectIndex === -1 ? '' : subjectIndex;
        }

        if (standardsLength && !isNil(query.grade) && subjectIndex) {
            gradeIndex = findIndex(standards.standards[standardsIndex]['subjects'][subjectIndex]['grades'], function(o) {
                return o.name == query.grade;
            });
            gradeIndex = gradeIndex === -1 ? '' : gradeIndex;
        }

        this.props.setSelectedStandardIndex({
            selectedStandardIndex: standardsIndex,
            selectedSubjectIndex: subjectIndex,
            selectedGradeIndex: gradeIndex
        });
    }
    onClickOnStandard(evt) {
        let link = evt.currentTarget.getAttribute('data-std_corr_href');
        this.getStandardsCorrelation(link);
        return false;
    }
    onChangeStandards(evt) {
        let id = evt.target.value,
            artifact = evt.target.getAttribute('data-artifactid'),
            link = `/ajax/boards/standards/correlated/${id}/${artifact}/`;
        this.getStandardsCorrelation(link);
    }
    getStandardsCorrelation(link) {
        const {
            standards,
            dispatch
        } = this.props;
        if (standards.standardsCorrelationsLink !== link) {
            dispatch(showModal({
                modalType: 'StandardsCorrelationsModal',
                modalProps: {
                    loader: true,
                    content: ''
                }
            }));
            this.props.getStandardsCorrelationsData({url: link}, this.afterStandardsCorrelationSuccess);
        } else {
            dispatch(showModal({
                modalType: 'StandardsCorrelationsModal',
                modalProps: {
                    content: standards.standardsCorrelationsData,
                    onChangeStandards: this.onChangeStandards
                }
            }));
        }
    }
    afterStandardsCorrelationSuccess() {
        const {
            standards,
            dispatch
        } = this.props;
        dispatch(showModal({
            modalType: 'StandardsCorrelationsModal',
            modalProps: {
                content: standards.standardsCorrelationsData,
                onChangeStandards: this.onChangeStandards
            }
        }));
    }
    onChangeOfStandards(evt) {
        const {
            standards: _standards,
            history,
            location
        } = this.props;
        if (evt.target.value === '1000') {
            window.location.href = '/cbse/';
            return;
        }

        let index = findIndex(_standards.standards, function(o) {
            return o.id == Number(evt.target.value);
        });
        if (index === -1) {
            index = '';
        }
        this.props.setSelectedStandardIndex({
            selectedStandardIndex: index,
            selectedSubjectIndex: '',
            selectedGradeIndex: ''
        });
        // maintain history
        if (index || index===0) {
            let standard = _standards.standards[index]['name'];

            history.replace({
                pathname: routes.contentPage.standards,
                // Reset all queries to just standard
                query: {standard}
            });
        }
    }
    onChangeOfSubjects(evt) {
        const {
            standards,
            history,
            location
        } = this.props;
        let index = findIndex(standards.standards[standards.selectedStandardIndex]['subjects'], function(o) {
            return o.name == evt.target.value;
        });
        if (index === -1) {
            index = '';
        }
        this.props.setSelectedSubjectIndex({
            selectedSubjectIndex: index,
            selectedGradeIndex: ''
        });

        // maintain history
        if (index || index===0) {
            let subject = standards.standards[standards.selectedStandardIndex]['subjects'][index]['name'];

            history.replace({
                pathname: routes.contentPage.standards,
                // Resets grades query if available
                query: {
                    subject,
                    standard: location.query.standard
                }
            });
        }
    }
    onChangeOfGrades(evt) {
        const {
            standards,
            history,
            location
        } = this.props;
        let subjectsData = standards.standards[standards.selectedStandardIndex]['subjects'];
        let index = findIndex(subjectsData[standards.selectedSubjectIndex]['grades'], function(o) {
            return o.name == evt.target.value;
        });
        if (index === -1) {
            index = '';
        } else {
            this.callServiceToGetBooksData(index);
        }
        this.props.setSelectedGradeIndex({
            selectedGradeIndex: index
        });

        // maintain history
        if (index || index===0) {
            let grade = subjectsData[standards.selectedSubjectIndex]['grades'][index]['name'];

            history.replace({
                pathname: routes.contentPage.standards,
                query: {
                    standard: location.query.standard,
                    subject:location.query.subject,
                    grade

                }
            });
        }
    }
    callServiceToGetBooksData(index) {
        const {
            standards
        } = this.props;
        let subjectsData = standards.standards[standards.selectedStandardIndex]['subjects'];
        this.props.getBooksData({
            subjectName: subjectsData[standards.selectedSubjectIndex]['name'],
            countryCode: standards.standards[standards.selectedStandardIndex]['countryCode'],
            standard: standards.standards[standards.selectedStandardIndex]['name'],
            standardId: standards.standards[standards.selectedStandardIndex]['id'],
            grade: subjectsData[standards.selectedSubjectIndex]['grades'][index]['name']
        }, this.afterBookDataSuccess);

        this.setState(Object.assign({}, this.state, {
            booksContainerDisplay: true,
            booksContainerLoaderDisplay: true
        }));
    }
    afterBookDataSuccess() {
        this.setState(Object.assign({}, this.state, {
            booksContainerLoaderDisplay: false
        }));
    }
    getDataResponse() {
        const {
            standards
        } = this.props;
        const standardsData = standards.standards;

        let subjectsData = (standards.selectedStandardIndex !== '') ? standardsData[standards.selectedStandardIndex]['subjects'] : [];
        let gradesData = (standards.selectedSubjectIndex !== '') ? subjectsData[standards.selectedSubjectIndex]['grades'] : [];
        let selectedStandard = (standards.selectedStandardIndex !== '') ? standardsData[standards.selectedStandardIndex]['name'] : '',
            selectedSubject = (standards.selectedSubjectIndex !== '') ? subjectsData[standards.selectedSubjectIndex]['name'] : '',
            selectedGrade = (standards.selectedGradeIndex !== '') ? gradesData[standards.selectedGradeIndex]['name'] : '';

        return {
            standardsData: standardsData,
            subjectsData: subjectsData,
            gradesData: gradesData,
            selectedStandard: selectedStandard,
            selectedSubject: selectedSubject,
            selectedGrade: selectedGrade,
            standardsEnable: true,
            subjectsEnable: (standards.selectedStandardIndex !== ''),
            gradesEnable: (standards.selectedSubjectIndex !== '')
        };
    }
    render(){
        const {standards} = this.props;
        return(
            <div className={`small-12 columns`}>
                <div className={`row row--fullWidth align-left ${styles.booksContainerTitle}`}><span>Standards Aligned FlexBook&reg; TextBooks</span></div>
                    <div className={`row row--fullWidth align-left ${styles.dropDownContainer}`}>
                        <div className={`small-12 columns large-1 ${styles.filterTitle}`}><span>Filter:</span></div>

                        <div id="standardsApp" className="columns"></div>
                    </div>
                <BooksContainer onClickOnStandard={this.onClickOnStandard} data={standards.booksData} loaderDisplay={this.state.booksContainerLoaderDisplay} containerDisplay={this.state.booksContainerDisplay}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        standards:state.standards
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        setSelectedStandardIndex: (standards) => dispatch(contentActions.setSelectedStandardIndex(standards)),
        setSelectedSubjectIndex: (standards) => dispatch(contentActions.setSelectedSubjectIndex(standards)),
        setSelectedGradeIndex: (standards) => dispatch(contentActions.setSelectedGradeIndex(standards)),
        getBooksData: (info,callback) => {
            return contentActions.getBooksData(dispatch,info,callback);
        },
        getStandardsCorrelationsData: (info,callback) => {
            contentActions.getStandardsCorrelationsData(dispatch,info,callback);
        }
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MathAndScienceStandards);
