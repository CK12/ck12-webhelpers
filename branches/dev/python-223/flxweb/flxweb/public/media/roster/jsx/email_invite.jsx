module.exports = (()=>{
    class EmailInvite extends React.Component{
        constructor(){
            super();
            this.state = {
                showFooter: false
            };
            this.hostname = window.location.hostname;
            this.footer = null;
            this.handleClick = this.handleClick.bind(this);
            this.createAccountsHandler = this.createAccountsHandler.bind(this);
            this.goToCreateAssignment = this.goToCreateAssignment.bind(this);
        }
        goToCreateAssignment(){
            window.location='/group-assignments/'+this.props.group.id;
        }
        handleClick(){
            let selection = window.getSelection();
            let range = document.createRange();
            let targetText = this.email;
            range.selectNodeContents(targetText);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');

            this.footer =(
                <div className="modal-footer">
                    <div className="footer-content">
                        Find resources on CK-12 to assign to your class
                    </div>
                    <div className="footer-btn">
                        <a className="button turquoise standard dxtrack-user-action"
                           data-dx-desc="roster_create_assignment_button"
                           data-dx-referrer="roster_invite_new_students_with_email_popup"
                           onClick={this.goToCreateAssignment}>Create Assignment</a>
                    </div>
                </div>
            );
            this.setState({showFooter: true});
        }
        createAccountsHandler(){
            this.props.goToView('create-account');
        }
        componentWillMount(){
            this.emailTemplate = 'mailto:?body='+
                                 'Hi there,%0D%0A'+
                                 'I\'d like you to join my CK-12 class:%0D%0A'+
                                 encodeURIComponent(this.props.group.name)+'%0D%0A%0D%0A'+
                                 'Joining my class allows me to share content with you and keep track of how well you do on your CK-12 practice assignment.%0D%0A%0D%0A'+
                                 'To join:%0D%0A'+
                                 '1. Go to '+this.hostname+'.%0D%0A'+
                                 '2. Click join to create an account, or Sign in.%0D%0A'+
                                 '3. Click Groups.%0D%0A'+
                                 '4. Click join a Group. (If you are a teacher, Click on the Plus Sign and choose \'Join a Group\')%0D%0A'+
                                 '5. Enter code: '+this.props.group.accessCode+'%0D%0A'+
                                 'You can also join the class by using this link:'+
                                 'https://'+this.hostname+'/join/group/?accessCode='+this.props.group.accessCode;
        }
        render(){
            return(
                <div>
                    <div className="modal-container">
                        <h3 className="title hide-for-small">Invite new Students with email</h3>
                        <h3 className="title show-for-small">Invite students with email</h3>
                        <div className="email-wrapper hide-for-small" ref={(emailTemplate)=> this.email = emailTemplate}>
                            Hi there, <br/>
                            I'd like you to join my CK-12 class:<br/>
                            <span className="class-name">{this.props.group.name}</span><br/><br/>
                            Joining my class allows me to share content with you and keep track of how well you do on your CK-12 practice assignment.<br /><br />
                            To join:<br />
                            1. Go to {this.hostname}.<br />
                            2. Click join to create an account, or Sign in.<br />
                            3. Click Groups.<br />
                            4. Click join a Group. (If you are a teacher, Click on the Plus Sign and choose 'Join a Group')<br />
                            5. Enter code: {this.props.group.accessCode}<br />
                            You can also join the class by using this link:
                            https://{this.hostname}/join/group/?accessCode={this.props.group.accessCode}
                        </div>
                        <div className="email-wrapper-small show-for-small">
                            <img src="/media/roster/images/email-invite.png" className=""></img>
                        </div>
                        <div className="button-wrapper">
                            <a className="button tangerine standard copy-btn dxtrack-user-action"
                               data-dx-desc="roster_email_students_button"
                               data-dx-referrer="roster_invite_new_students_with_email_popup"
                               href={this.emailTemplate}
                               target="_blank"
                               onClick={this.handleClick}>
                               Email Students
                            </a>
                        </div>
                        <div className="message-wrapper">
                            <span className="hide-small">Student don't have email?</span>
                            <div className="show-for-small">Student don't have email?</div>
                            <a className="dxtrack-user-action"
                               data-dx-desc="roster_create_student_accounts_link"
                               data-dx-referrer="roster_invite_new_students_with_email_popup"
                               onClick={this.createAccountsHandler}> Create student accounts</a>
                        </div>
                    </div>
                    {this.footer}
                </div>
            );
        }
    }
    return EmailInvite;
})();
