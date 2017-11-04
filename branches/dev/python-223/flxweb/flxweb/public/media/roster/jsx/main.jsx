require('../scss/roster.scss');

import React from 'react';
import ReactDom from 'react-dom';

import Menu from './menu/menu.jsx';
import EmailInvite from './email_invite.jsx';
import AddClassRoster from './add_class_roster.jsx';
import CreateAccount from './create_account/create_account.jsx';
import CreateAccountResult from './create_account/create_account_result.jsx';
import AddExistingStudent from './add_existing_student/add_existing_student.jsx';
import AddExistingStudentResult from './add_existing_student/add_existing_student_result.jsx';
import {getMyStudents} from '../services/roster.services';

let AppContainer = class RosterContainer extends React.Component {
    constructor(){
        super();
        this.state = {view:'menu'};
        this.goToView = this.goToView.bind(this);
        this.data=[];
    }
    goToView(viewName, data){
        this.data = data || [];
        this.setState({
            view: viewName
        });
    }
    componentWillMount(){
        this.state.view = this.props.initView;
    }
    render(){
        let view = null;
        switch (this.state.view) {
            case 'menu':
                view = <Menu goToView={this.goToView}/>;
                break;
            case 'menu2':
                view = <Menu goToView={this.goToView} disabledOneView/>
                break;
            case 'email-invite':
                view = <EmailInvite goToView={this.goToView} group={this.props.group}/>;
                break;
            case 'create-account':
                view = <CreateAccount goToView={this.goToView} data={this.data} group={this.props.group}/>
                break;
            case 'create-account-result':
                view = <CreateAccountResult goToView={this.goToView} data={this.data} group={this.props.group}/>
                break;
            case 'add-existing-student':
                view = <AddExistingStudent goToView={this.goToView} group={this.props.group}/>
                break;
            case 'add-existing-student-result':
                view = <AddExistingStudentResult goToView={this.goToView} names={this.data} group={this.props.group}/>
                break;
            case 'upload-class-roster':
                view = <AddClassRoster goToView={this.goToView} names={this.data} group={this.props.group}/>
                break;
            default:
                view = <Menu goToView={this.goToView}/>;
                break;
        }

        return (
            <div className="roster-app">
                {view}
            </div>
        );

    }
};
const init = (config)=>{
    config.group.id += ''; // force group id  to be string
    ReactDom.unmountComponentAtNode(config.elm);
    ReactDom.render(<AppContainer initView={config.initView} group={config.group}/>, config.elm);
};

module.exports = {
    init
};
