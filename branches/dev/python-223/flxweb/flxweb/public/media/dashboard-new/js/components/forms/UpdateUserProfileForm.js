import React, {Component} from 'react';
import {reduxForm} from 'redux-form';
import {size, includes, forOwn, isString, isArray, isEqual } from 'lodash';
import {Promise} from 'bluebird';

import { FormGroup, FormError, Radio } from 'components/common/forms';
import MockSelectbox from 'components/common/MockSelectbox';
import {
    UserLocation,
    UserPhoto,
    List,
    Loader,
    SubjectsPicker,
    GradesPicker
} from 'components';

import { setUser } from 'actions/userActions';
import { showModal, hideModal } from 'actions/modalActions';
import { setUserGrades } from 'actions/userGradesActions';

import { updateMember } from 'services/userService';

import GRADES from 'sources/grades';

import { changeNavigationUserName } from 'externals';
import { capitalizeWords } from 'utils/formatting';

import formStyles from 'scss/components/common/forms/Form';
import { radio } from 'scss/components/common/forms/Radio';
import styles from 'scss/components/forms/UpdateUserProfile';

const locationFields = ['zip', 'state', 'province', 'country', 'city'];

const fields = [
    'roleID',
    'imageURL',
    ...locationFields,
    'userName',
    'gradeIDs',
    'userSubjects'
];

const STUDENT_ID = 7,
    TEACHER_ID = 5;

function isTeacher({value}){
    return value == TEACHER_ID;
}

// Client side validation
const validate = values => {
    const errors = {};

    if (!isString(values.userName) || !values.userName.trim()) {
        errors.userName = 'Please enter your name.';

    } else if(!/^[^/\\()~!@#$%^<>&|*]*$/.test(values.userName.trim())){
        errors.userName = 'Please only use valid characters.';
    }

    return errors;
};

// Server side validation
function getErrorMessage(error){
    if(!(error instanceof Error)){ return; }
    return error;
}


class UpdateUserProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subjectsPickerOpen: false,
            gradesPickerOpen: false,
            locationChangeOpen: false,
            imageURL: null
        };

        this.onSubmit = this.onSubmit.bind(this);

        this.toggleSubjectsPicker = this.toggleSubjectsPicker.bind(this);
        this.toggleGradesPicker = this.toggleGradesPicker.bind(this);
        this.toggleLocationChange = this.toggleLocationChange.bind(this);

        this.updateAddressValues = this.updateAddressValues.bind(this);
        this.updateUserImageURL  = this.updateUserImageURL.bind(this);

        this.updateGradesForRole  = this.updateGradesForRole.bind(this);
    }

    onSubmit(values, dispatch){
        const { user: {id, isProfileUpdated, role: {id:_roleID} }, fields } = this.props;

        let _values   = Object.assign({}, values),
            validKeys = ['roleID', 'imageURL', 'userName', ...locationFields],
            firstName, lastName;

        firstName = lastName = '';

        // Delete invalid keys
        forOwn(_values, (v, key)=>{
            if(!includes(validKeys, key)){
                delete _values[key];
            }
        });

        // Split user name into first and last name
        if(_values.userName){
            let userName = _values.userName.split(' ');
            let _lastName = userName.length <= 1 ? '' : userName.slice(1).join(' ');

            firstName = _values.firstName = userName[0];
            lastName  = _values.lastName  = _lastName;
            delete _values.userName;
        }

        // Set country code
        if( /:\s{1}/.test(_values.country) ){
            _values['countryCode'] = _values.country.split(': ')[0];
        }

        // Bug 51048 - Setting a province with no state will return a blank province and state on subsequent API calls
        if(_values.province && !_values.state){
            _values.state = _values.province;
        }

        // Must invalidate client and flag profile as being updated
        _values['invalidate_client'] = true;
        _values['isProfileUpdated']  = 1;

        // Handle Address
        const address = locationFields.reduce((prev, next)=>{
            prev[next] = _values[next];
            return prev;
        }, {});

        // Set role
        const roleID = _values['roleID'] || _roleID;

        // Sync current user image URL
        if(_values.imageURL !== this.state.imageURL || !_values.imageURL){
            _values.imageURL = this.state.imageURL;
        }

        return new Promise((resolve, reject) => {
            updateMember(id, _values)
                .then(res => {

                    if(Number(roleID) === STUDENT_ID){ return location.href = '/my/dashboard'; }

                    if(firstName){ changeNavigationUserName(`${firstName} ${lastName}`); }

                    dispatch(setUser({
                        isProfileUpdated: 1,
                        address,
                        firstName,
                        lastName,
                        roleID
                    }));

                    if(!isProfileUpdated){
                        dispatch(showModal({
                            modalType: 'UpdateUserProfileSuccessModal',
                            modalProps: {}
                        }));
                    } else {
                        dispatch(hideModal());
                    }

                    resolve();
                })
                .catch(error => reject(getErrorMessage(error)) );
        });
    }

    toggleSubjectsPicker(){
        this.setState(
            Object.assign({}, this.state, {
                subjectsPickerOpen: !this.state.subjectsPickerOpen
            })
        );
    }

    toggleGradesPicker(){
        this.setState(
            Object.assign({}, this.state, {
                gradesPickerOpen: !this.state.gradesPickerOpen
            })
        );
    }

    toggleLocationChange(){
        this.setState(
            Object.assign({}, this.state, {
                locationChangeOpen: !this.state.locationChangeOpen
            })
        );
    }

    updateAddressValues(address){
        const { fields } = this.props;

        locationFields.forEach((key)=>{
            const hasKey = fields.hasOwnProperty(key);
            if(hasKey && address.hasOwnProperty(key)){
                fields[key].onChange(address[key]);

            } else if(hasKey){
                // Reset value
                fields[key].onChange('');
            }
        });
    }

    updateUserImageURL(imageURL=null){
        this.setState(Object.assign({}, {
            imageURL
        }));
    }

    getAddressValues(){
        const { fields } = this.props;
        const fieldKeys = ['city', 'state', 'country'];
        let location = {};

        fieldKeys.reduce((prev, next)=>{
            if(fields.hasOwnProperty(next) && fields[next].value){
                prev[next] = fields[next].value;
            }
            return prev;
        }, location);

        return size(location) === size(fieldKeys) ? location : false;
    }

    getGradesNames({value}){
        // Ensure all values are ints
        const values = isArray(value) ? value.map((val)=>parseInt(val)) : [parseInt(value)];

        return GRADES
            .filter(grade=> includes(values, grade.id))
            .sort((a, b)=> a.id - b.id)
            .map(grade=> grade.longname ? grade.longname.replace(' Grade', '') : 'Kindergarten');
    }

    getGradesCount(){
        const { fields: { gradeIDs } } = this.props;

        if(!gradeIDs.value){ return 0; }

        const value = isArray(gradeIDs.value) ? gradeIDs.value : [gradeIDs.value];
        return value.length;
    }

    updateGradesForRole(prevProps){
        const { setUserGrades, fields: { roleID, gradeIDs } } = this.props;
        const { fields: { roleID:prevRoleID, gradeIDs:prevGradeIDs } } = prevProps;

        // A student that has multiple grades
        if(!isTeacher(roleID) && isArray(gradeIDs.value) && size(gradeIDs.value) > 1 ){
            gradeIDs.value = [ gradeIDs.value[0] ]; // Students should only have one grade
            setUserGrades(gradeIDs.value);

        } else if (!isTeacher(prevRoleID) && !isEqual(prevGradeIDs, gradeIDs)){ // i.e. switching back to teacher role from student
            setUserGrades(gradeIDs.value);
        }
    }

    componentDidUpdate(prevProps){
        this.updateGradesForRole(prevProps);
    }

    render() {
        const {
            fields: { roleID, gradeIDs, userSubjects, userName },
            user,
            dispatch,
            handleSubmit,
            submitting
        } = this.props;

        const { address } = user;
        const { gradesPickerOpen, subjectsPickerOpen, locationChangeOpen } = this.state;

        const isFirstTimeUser = user.isProfileUpdated == 0;

        const _isTeacher = isTeacher(roleID);
        const selectedRoleClass = _isTeacher ? styles.teacher : styles.student;

        const buttonText   = isFirstTimeUser ? `Let's get started!` : 'Update Profile';
        const visibleClass = isFirstTimeUser ? 'show' : 'hide';

        return (
            <form className={`${styles.form} ${formStyles.form}`} onSubmit={handleSubmit(this.onSubmit)}>
                <div className={`row align-center`}>
                    <div className={`small-10 columns`}>

                        <div className={styles.userPhoto}>
                            <UserPhoto user={user} dispatch={dispatch} callback={this.updateUserImageURL} />
                        </div>

                        <div className={`row`}>
                            <div className="column">
                                <h5><strong>Welcome to CK-12</strong></h5>
                                <p>Please update your profile.</p>
                            </div>
                        </div>

                        <div className={`row`}>
                            <FormGroup {...userName} className={`column`} >
                                <FormError {...userName} />
                                <label>Your Name
                                    <input type="text" {...userName} />
                                </label>
                            </FormGroup>
                        </div>

                        <div className={`row ${styles.userLocationRow}`}>
                            <div className="column">
                                <UserLocation
                                    location={this.getAddressValues() || address}
                                    isOpen={locationChangeOpen}
                                    toggleLocation={this.toggleLocationChange}
                                    locationChangedCallback={this.updateAddressValues}
                                />
                            </div>
                        </div>

                        <div className={`row ${styles.userTypeRow} ${selectedRoleClass} ${visibleClass}`}>
                            <FormGroup element="fieldset" className={`column small-12`} {...roleID}>
                                <FormError {...roleID} />
                                <div className={`row align-stretch`}>
                                    <div className={`${styles.userTypeRowSelector} column small-6`}></div>

                                    <Radio className={radio} id="classType" value={TEACHER_ID} field={roleID} />
                                    <label htmlFor="classType" className="column small-5">
                                        <span>
                                            <strong>Teacher</strong>
                                        </span>
                                    </label>

                                    <Radio className={radio} id="studyGroupType" value={STUDENT_ID} field={roleID} />
                                    <label htmlFor="studyGroupType" className="column small-5">
                                        <span>
                                            <strong>Student</strong>
                                        </span>
                                    </label>
                                </div>
                            </FormGroup>
                        </div>

                        <div className={`row align-justify ${styles.gradeSubjectRow} text-center`}>
                            <div className="column small-6">
                                <div className={styles.buttonContainer}>
                                    <MockSelectbox onClick={this.toggleGradesPicker} type='grade' count={this.getGradesCount()} />
                                    { gradesPickerOpen ? <GradesPicker onClose={this.toggleGradesPicker} field={gradeIDs} isTeacher={_isTeacher} /> : null }
                                </div>
                                <List list={this.getGradesNames(gradeIDs)} className='hide-for-small-only' />
                            </div>
                            <div className="column small-6">
                                <div className={styles.buttonContainer}>
                                    <MockSelectbox onClick={this.toggleSubjectsPicker} type='subject' count={userSubjects.value.length} />
                                    { subjectsPickerOpen ? <SubjectsPicker onClose={this.toggleSubjectsPicker} field={userSubjects} /> : null }
                                </div>
                                <List list={userSubjects.value} className='hide-for-small-only' />
                            </div>
                        </div>

                        <div className="row align-center">
                            <div className="column small-8">
                                <button className={`button expanded dxtrack-user-action`} type="submit" disabled={submitting} data-dx-desc={"Update User Profile"}>
                                    {buttonText} {submitting ? <Loader /> : null}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        );
    }
}

const mapStateToProps = (_state) => {
    const {
        address: {zip='', city='', state='', province='', country=''},
        firstName='',
        lastName='',
        imageURL='',
        role: {id:roleID=TEACHER_ID}
    } = _state.user;

    const userSubjects = _state.userSubjects.subjects.map( subject => capitalizeWords(subject.name) );
    const gradeIDs     = _state.userGrades.grades.map( grade => grade.id );

    return {
        initialValues: {
            userName: `${firstName} ${lastName}`,
            roleID,
            imageURL,
            zip,
            city,
            state,
            province,
            country,
            userSubjects,
            gradeIDs
        },
        overwriteOnInitialValuesChange: false
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUserGrades: (grades) => {
            setUserGrades(grades, dispatch);
        }
    };
};

export default reduxForm({
    form: 'updateUserProfile',
    fields,
    validate
},
mapStateToProps,
mapDispatchToProps
)(UpdateUserProfile);