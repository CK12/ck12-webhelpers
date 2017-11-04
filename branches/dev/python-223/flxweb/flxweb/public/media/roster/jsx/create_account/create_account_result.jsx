import CreateAccountResultRow from './create_account_result_row.jsx';
module.exports = (()=>{
    class CreateAccountResult extends React.Component {
        constructor() {
            super();
            this.fixError = this.fixError.bind(this);
            this.handleClick = this.handleClick.bind(this);
            this.goGroupMemeberPage = this.goGroupMemeberPage.bind(this);
            this.goToCreate = this.goToCreate.bind(this);
            this.state = {showPassword: true};
        }
        handleClick(){
            this.setState({
                showPassword: !this.state.showPassword
            });
        }
        goToCreate(){
            this.props.goToView('create-account');
        }
        goGroupMemeberPage(){
            window.location='/group-members/'+this.props.group.id;
        }
        fixError(){
            this.props.goToView('create-account', this.props.data.errorAccounts);
        }
        render(){
            let key = 0;
            let resultRows = this.props.data.errorAccounts.map((userInfo)=>{
                return (<CreateAccountResultRow userInfo={userInfo} key={key++} showPassword={this.state.showPassword}/>);
            });
            this.props.data.successAccounts.forEach((userInfo)=>{
                resultRows.push(<CreateAccountResultRow userInfo={userInfo} key={key++} showPassword={this.state.showPassword} hideIcon={this.props.data.errorAccounts.length===0}/>);
            });

            let title = null;
            let bottom = null;
            let reminder = null;
            let successNum = this.props.data.successNum;
            let totalNum = this.props.data.totalNum;
            if(successNum > 0){
                reminder = (
                    <div className="large-9 small-12 columns reminder">
                        <div className="reminder-img"><img src="/media/roster/images/take-note-blue.png"></img></div>
                            <div className="reminder-message">
                            <span>Make a note of account passwords now.</span>
                            <div>Password information will be hidden after this screen.</div>
                        </div>
                    </div>
                );
            }else{
                reminder = (<div className="large-9 small-12 columns reminder"></div>);
            }
            if(successNum === totalNum){
                title = (
                    <span>
                        <i className="icon-validated"></i>{this.props.data.successNum} account{this.props.data.successNum > 1? 's':''} created
                    </span>
                );
                bottom = (
                    <div className="table-bottom row">
                        {reminder}
                        <div className="large-3 small-12 columns button-container">
                            <button className="button turquoise view-btn hide-small dxtrack-user-action"
                                    data-dx-desc="roster_view_students_button"
                                    data-dx-referrer="roster_after_create_accounts_for_students_popup"
                                    onClick={this.goGroupMemeberPage}>View Students</button>
                            <button className="button turquoise view-btn show-for-small dxtrack-user-action"
                                    data-dx-desc="roster_create_a_new_account_button"
                                    data-dx-referrer="roster_after_create_accounts_for_students_popup"
                                    onClick={this.goToCreate}>Create a New Account</button>
                            <a onClick={this.goGroupMemeberPage}
                               className="show-for-small dxtrack-user-action"
                               data-dx-desc="roster_view_students_link"
                               data-dx-referrer="roster_after_create_accounts_for_students_popup">View Students</a>
                        </div>
                    </div>
                );
            } else {
                title = (
                    <div>
                        <span className="hide-for-small">
                            <img src="/media/roster/images/notification-2.svg" className="notification"></img>
                            Only {successNum} out of {totalNum} accounts created!
                        </span>
                        <div className="show-for-small">
                            <img src="/media/roster/images/notification-2.svg" className="notification"></img>
                            <div>
                                Oops! Try again.
                            </div>
                        </div>
                    </div>
                );
                bottom = (
                    <div className="table-bottom row">
                        {reminder}
                        <div className="large-3 small-12 columns button-container">
                            <button className="button turquoise view-btn dxtrack-user-action"
                                    data-dx-desc="roster_fix_errors_button"
                                    onClick={this.fixError}
                                    data-dx-referrer="roster_after_create_accounts_for_students_popup">Fix Errors</button>
                            <div className="hide-for-small bottom-message">Correct the errors to create the remaining {totalNum-successNum} account{totalNum-successNum > 1? 's':''}.</div>
                            <a className="show-for-small dxtrack-user-action"
                               data-dx-desc="roster_create_a_new_account_link"
                               data-dx-referrer="roster_after_create_accounts_for_students_popup"
                               onClick={this.goToCreate}>Create a new account</a>
                        </div>
                    </div>
                );
            }
            return(
                <div className="create-accounts-container">
                    <h3 className="title center">{title}</h3>
                    <div className="table-title-container row hide-for-small">
                        <div className="large-12 columns">
                            <div className="large-3 columns input-info">First Name</div>
                            <div className="large-3 columns input-info">Last Name</div>
                            <div className="large-3 columns input-info">Unique Username</div>
                            <div className="large-3 columns input-info">Password
                                <a onClick={this.handleClick}
                                   className="dxtrack-user-action"
                                   data-dx-desc={this.state.showPassword? 'roster_hide_link':'roster_show_link'}
                                   data-dx-referrer="roster_after_create_accounts_for_students_popup">
                                   {this.state.showPassword?' Hide':' Show'}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="table-content-container">
                        <div className="large-12 columns">
                            <div className="input-result-wrapper">
                                {resultRows}
                            </div>
                        </div>
                    </div>
                    {bottom}

                </div>
            );
        }
    }
    return CreateAccountResult;
})();
