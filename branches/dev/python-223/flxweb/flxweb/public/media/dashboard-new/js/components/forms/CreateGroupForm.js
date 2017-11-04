import React, {Component} from 'react';
import {reduxForm} from 'redux-form';

import {Promise} from 'bluebird';

import { FormGroup, FormError, Radio } from 'components/common/forms';
import MockSelectbox from 'components/common/MockSelectbox';
import { List, Loader, SubjectsPicker } from 'components';

import { createGroup, getThemeImages } from 'services/groupsService';

import { hideModal } from 'actions/modalActions';
import { addGroup } from 'actions/groupsActions';
import { incrementCount } from 'actions/countsActions';

import formStyles from 'scss/components/common/forms/Form';
import styles from 'scss/components/forms/CreateGroupForm';
import { radio } from 'scss/components/common/forms/Radio';

import {pick, map, isString} from 'lodash';

const fields = ['groupName','groupDescription', 'groupScope', 'groupType', 'resourceRevisionID', 'groupSubjects'];

// Client side validation
const validate = values => {
    const errors = {};

    if (!isString(values.groupName) || !values.groupName.trim()) {
        errors.groupName = 'Enter a name for your group. For example: Math Geeks Unite!';
    }

    if (!values.groupType) {
        errors.groupType = 'Please select a group type.';
    }

    return errors;
};

// Server side validation
function getErrorMessage(error){
    if(!(error instanceof Error)){ return; }
    let _error = {};
    // Group names
    // IE11 superagent returns bad request instead of server in the case of duplicate group names being used
    if(/(Bad Request|Cannot create group)/i.test(error.message)) {
        _error._error    = 'Cannot create group';
        _error.groupName = 'You already created a group with that name. Enter a unique name so you can tell them apart.';
    }

    return _error;
}


class CreateGroupForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            themeImages: [],
            subjectsPickerOpen: false
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.toggleSubjectPicker = this.toggleSubjectPicker.bind(this);
    }

    componentDidMount(){
        if(!this.state.themeImages.length){
            getThemeImages().then(res => {
                this.setState(
                    Object.assign({}, this.state, {
                        themeImages: map(res.resources, (resource) => pick(resource, ['resourceRevisionID', 'uri']))
                    })
                );
            });
        }
    }

    onSubmit(values, dispatch){
        const _values = Object.assign({}, values, {
            groupSubjects: values.groupSubjects.join(',') || ''
        });

        return new Promise((resolve, reject) => {
            createGroup(_values)
                .then(res => {
                    dispatch(hideModal());
                    dispatch(incrementCount('class-count', 1));
                    dispatch(addGroup(res.group));
                    resolve();
                    return null; // Runaway promise: http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
                })
                .catch(error => reject(getErrorMessage(error)) );
        });
    }

    toggleSubjectPicker(){
        this.setState(
            Object.assign({}, this.state,
                {
                    subjectsPickerOpen: !this.state.subjectsPickerOpen
                }
            )
        );
    }

    getGroupTypeText({value}){
        if(value === 'study'){
            return 'study group';
        } else {
            return value || 'group';
        }
    }

    render() {
        const {
            fields: {groupName, groupDescription, groupType, resourceRevisionID, groupSubjects},
            handleSubmit,
            submitting
        } = this.props;

        const { subjectsPickerOpen } = this.state;


        const groupTypeText = this.getGroupTypeText(groupType);

        return (
            <form className={`${styles.createGroupForm} ${formStyles.form}`} onSubmit={handleSubmit(this.onSubmit)}>
                <div className={`row ${styles.headerRow}`}>
                    <div className="column">
                        <h5><strong>Create a new group</strong></h5>
                        <p>Start a group to share resources, assign practice, and track progress.</p>
                    </div>
                </div>

                <div className="row">
                    <div className={`column small-8 ${styles.groupName}`} >
                        <FormGroup {...groupName} >
                            <FormError {...groupName} />
                            <label>Group Name
                                <input type="text" placeholder={`My new ${groupTypeText}`} {...groupName} />
                            </label>
                        </FormGroup>
                        <textarea className={styles.groupDescription} placeholder={`Optional ${groupTypeText} description`} maxlength="300" {...groupDescription} ></textarea>
                    </div>
                    <FormGroup element="fieldset" className={`${styles.groupType} column small-4`} {...groupType}>
                        <FormError {...groupType} />
                        <legend>Select Type</legend>
                        <div className={`row align-stretch`}>
                            <Radio className={radio} id="classType" value="class" field={groupType} />
                            <label htmlFor="classType" className="column small-12">
                                <span>
                                    <i className="icon-lessonplans"></i>
                                    <strong>Class</strong>
                                    <span className={'hide-for-small-only'}>Assign homework, track student progress, and have class discussions.</span>
                                </span>
                            </label>
                            <Radio className={radio} id="studyGroupType" value="study" field={groupType} />
                            <label htmlFor="studyGroupType" className="column small-12">
                                <span>
                                    <i className="icon-groups"></i>
                                    <strong>Study <span className={'hide-for-small-only'}>Group</span></strong>
                                    <span className={'hide-for-small-only'}>Chat about group projects and study with friends.</span>
                                </span>
                            </label>
                        </div>
                    </FormGroup>
                </div>

                <div className={`row align-center ${styles.groupSubjectsRow}`}>
                    <div className="column small-9 text-center">
                        <div className={styles.buttonContainer}>
                            <MockSelectbox onClick={this.toggleSubjectPicker} type='subject' count={groupSubjects.value.length} style={{width: '50%'}}/>
                            { subjectsPickerOpen ? <SubjectsPicker onClose={this.toggleSubjectPicker}  field={groupSubjects} onCloseCallback={()=>{}} /> : null }
                        </div>
                        <List list={groupSubjects.value} className='hide-for-small-only' />
                    </div>
                </div>

                <div className={`row align-center ${styles.groupThemeRow}`}>
                    <fieldset className="columns small-8 text-center">
                        <legend style={{width: '100%'}}>Choose theme</legend>
                        <div className="row collapse align-stretch">
                            {this.state.themeImages.map( themeImage => {
                                return <ThemeImage key={themeImage.resourceRevisionID} field={resourceRevisionID} {...themeImage} />;
                            })}
                        </div>
                    </fieldset>
                </div>

                <div className="row align-center">
                    <div className="column small-6">
                        <button className="button expanded dxtrack-user-action" type="submit" disabled={submitting} data-dx-desc={"Create Group"}>
                            {submitting ? 'Creating Group... ' : 'Create a group'} {submitting ? <Loader /> : null}
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}

const ThemeImage = (props) => {
    const {field, resourceRevisionID, uri} = props;

    return (
        <div className="column">
            <Radio className={radio} id={resourceRevisionID} value={resourceRevisionID} className={`hide ${styles.themeImageRadio}`} field={field} />
            <label htmlFor={resourceRevisionID} className={styles.themeImageLabel}>
                <i className="icon-checkmark"></i>
                <img src={uri} />
            </label>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        initialValues: {
            groupName: '',
            groupDescription: '',
            groupScope: 'closed',
            groupType: 'class',
            resourceRevisionID: 6900309,
            groupSubjects: []
        }
    };
};

export default reduxForm({
    form: 'createGroup',
    fields,
    validate
},
mapStateToProps
)(CreateGroupForm);