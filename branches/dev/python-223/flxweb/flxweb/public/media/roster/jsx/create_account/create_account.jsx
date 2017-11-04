import CreateAccountRow from './create_account_row.jsx';
import {createAccount, addStudentToGroup} from '../../services/roster.services';
import Promise from 'bluebird';

module.exports = (()=>{
    class CreateAccount extends React.Component {
        constructor() {
            super();
            this.state = {
                accounts: [{
                    id:0,
                    firstname:'',
                    lastname:'',
                    username:'',
                    password:''
                }],
                showCreateBtn: false,
                creating: false
            };
            this.uniqueKey = 0;
            this.state.showPassword = true;
            this.createAcounts = this.createAcounts.bind(this);
            this.removeRow = this.removeRow.bind(this);
            this.handleClick = this.handleClick.bind(this);
            this.handleKeyPress = this.handleKeyPress.bind(this);
            this.isEmptyRow = this.isEmptyRow.bind(this);
            this.enableCreateBtn = this.enableCreateBtn.bind(this);
            this.validateAccount = this.validateAccount.bind(this);
            this.isDupcatedAccount =  this.isDupcatedAccount.bind(this);
        }
        addNewRow(){
            this.uniqueKey++;
            let accounts = this.state.accounts;
            accounts.push({
                id:this.uniqueKey,
                firstname:'',
                lastname:'',
                username:'',
                password:''
            });
            this.setState(accounts);
        }
        componentDidUpdate(){
            this.tableBody.scrollTop = 999999;
        }
        componentWillMount(){
            if(this.props.data.length >0){
                this.state.accounts = this.props.data;
                this.uniqueKey = 500;
                this.state.showCreateBtn = true;
            }
        }
        isEmptyRow(row){
            let keys = Object.keys(row);
            let count = 0;
            keys.forEach((key)=>{
                if(row[key].length > 0){
                    count++;
                }
            });
            return count === 0;
        }
        isDupcatedAccount(accounts, newAccount){
            return accounts.some((account)=>{
                if(account.username.toLowerCase() === newAccount.username.toLowerCase()){
                    newAccount.status = 'usernameError';
                    newAccount.errorMessage = 'The username is already taken';
                    return true;
                }
                return false;
            });
        }
        isRequired0k(account){
            let countRequireFiled = 0;
            if(account.firstname.trim().length > 0){
                countRequireFiled++;
            }
            if(account.username.trim().length > 0){
                countRequireFiled++;
            }
            if(account.password.trim().length > 0){
                countRequireFiled++;
            }
            return countRequireFiled === 3;
        }
        enableCreateBtn(){
            for(let i = 0; i < this.state.accounts.length; i++){
                if(this.isRequired0k(this.state.accounts[i])){
                    this.setState({showCreateBtn:true});
                    return;
                }
            }
            if(this.state.showCreateBtn){
                this.setState({showCreateBtn: false});
            }
        }
        validateAccount(account){
            if(account.firstname.trim().length === 0){
                account.status = 'firstnameError';
                account.errorMessage='First name is required';
                return false;
            }
            if(account.username.trim().length === 0){
                account.status = 'usernameError';
                account.errorMessage = 'Username is required';
                return false;
            }
            if(account.password.trim().length < 6){
                account.status = 'passwordError';
                account.errorMessage = 'Password needs to be at least 6 characters';
                return false;
            }
            if(!/\d/.test(account.password.trim())){
                account.status = 'passwordError';
                account.errorMessage = 'Password must contain at least one number';
                return false;
            }
            if(!(/^[^/\\()\[\]:~!@#$%^<>&|*]*$/).test(account.firstname.trim())){
                account.status = 'firstnameError';
                account.errorMessage = 'Special Characters are not allowed';
                return false;
            }
            if(!(/^[^/\\()\[\]:~!@#$%^<>&|*]*$/).test(account.lastname.trim())){
                account.status = 'lastnameError';
                account.errorMessage = 'Special Characters are not allowed';
                return false;
            }
            if(account.username.trim().length < 3){
                account.status = 'usernameError';
                account.errorMessage = 'Username needs to be at least 3 characters';
                return false;
            }
            if((!(/^((?=.*\d)|(?=.*\w)(?!").*)|[^\x00-\x80]+$/).test(account.username.trim())) || (/[^\w\-]/gi).test(account.username.trim())){
                account.status = 'usernameError';
                account.errorMessage = 'Special Characters are not allowed';
                return false;
            }

            if(account.status !== 0){
                return false;
            }
            return true;
        }
        createAcounts(){
            var successNum = 0;
            let allPromises = [];
            let validAccounts = [];
            let errorAccounts = [];
            let successAccounts = [];
            this.setState({
                creating: true
            });
            this.state.accounts.forEach((account) =>{
                if(!this.isEmptyRow(account)){
                    if(this.validateAccount(account) && !this.isDupcatedAccount(validAccounts, account)){
                        validAccounts.push(account);
                        var data = {
                            firstName: account.firstname.trim(),
                            lastName: account.lastname.trim(),
                            login: account.username.trim(),
                            password: account.password.trim()
                        };
                        allPromises.push(createAccount(data));
                    }else{
                        errorAccounts.push(account);
                    }
                }
            });
            Promise.all(allPromises).then((data)=>{
                let successPromises = [];
                for(let i = 0; i < data.length; i++){
                    let account = data[i];
                    if(account.responseHeader && account.responseHeader.status !== 0){
                        validAccounts[i].errorMessage = account.response.message;
                        validAccounts[i].status = account.responseHeader.status;
                        errorAccounts.push(validAccounts[i]);

                    }else{
                        successNum++;
                        validAccounts[i].status = account.responseHeader.status;
                        successPromises.push(addStudentToGroup({
                            groupID: this.props.group.id,
                            memberID: data[i].id
                        }));
                        successAccounts.push(validAccounts[i]);
                    }

                }
                Promise.all(successPromises).then(()=>{
                    this.setState({creating: false});
                    this.props.goToView('create-account-result',{
                        successNum: successNum,
                        totalNum: successNum+errorAccounts.length,
                        errorAccounts: errorAccounts,
                        successAccounts: successAccounts
                    });
                });
            });

        }
        removeRow(targetRow){
            let index = this.state.accounts.indexOf(targetRow);
            this.state.accounts.splice(index,1);
            this.setState(this.state);
        }
        handleClick(){
            this.state.showPassword = !this.state.showPassword;
            this.setState(this.state);
        }
        handleKeyPress(event){
            if(event.charCode === 13){
                this.addNewRow();
            }
        }
        componentDidMount(){
            this.tableBody.getElementsByTagName('input')[0].focus();
        }
        render(){
            let accounts = this.state.accounts;
            let length = accounts.length;
            let accountsComponent = accounts.map((account)=>{
                return (
                    <CreateAccountRow
                        key={account.id}
                        account={account}
                        hideRemoveBtn={length === 1}
                        removeRow={this.removeRow}
                        showPassword={this.state.showPassword}
                        enableCreateBtn = {this.enableCreateBtn}
                    />
                );
            });

            let createBtn = null;
            if(this.state.showCreateBtn && !this.state.creating){
                createBtn = <div className="button standard create-btn right tangerine dxtrack-user-action"
                                 data-dx-desc="roster_create_button"
                                 data-dx-referrer="roster_create_accounts_for_students_popup"
                                 onClick={this.createAcounts}>Create</div>;
            }else if(this.state.creating){
                createBtn = <div className="button standard tangerine right dxtrack-user-action"
                                 data-dx-desc="roster_creating_button"
                                 data-dx-referrer="roster_create_accounts_for_students_popup">Creating...</div>;
            }else{
                createBtn = <div className="button standard grey disabled right" disabled>Create</div>;
            }
            return(
                <div className="create-accounts-container" onKeyPress={this.handleKeyPress}>
                    <h3 className="title">Create accounts for students</h3>
                    <div className="table-title-container create-accounts row hide-for-small">
                        <div className="large-12 columns">
                            <div className="large-3 columns input-info">First Name</div>
                            <div className="large-3 columns input-info">Last Name <span className="optional">(optional)</span></div>
                            <div className="large-3 columns input-info">Unique Username</div>
                            <div className="large-3 columns input-info">Password
                                <a className="dxtrack-user-action"
                                   data-dx-desc={this.state.showPassword? 'roster_hide_link':'roster_show_link'}
                                   data-dx-referrer="roster_create_accounts_for_students_popup"
                                   onClick={this.handleClick}>
                                   {this.state.showPassword? ' Hide':' Show'}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="table-content-container row" ref={(tableBody)=> this.tableBody=tableBody}>
                        <div className="large-12 columns">
                            <div className="input-wrapper">
                                {accountsComponent}
                                <div className="hide-for-small">
                                    <div className="large-3 columns input-info">
                                        <div className="add-btn-container">
                                            <a onClick={this.addNewRow.bind(this)}
                                               className="dxtrack-user-action"
                                               data-dx-desc="roster_add_link"
                                               data-dx-referrer="roster_create_accounts_for_students_popup"><i className="icon-add"></i> Add</a>
                                        </div>
                                    </div>
                                    <div className="large-3 columns input-info">
                                        <div className="add-btn-container "></div>
                                    </div>
                                    <div className="large-3 columns input-info">
                                        <div className="add-btn-container"></div>
                                    </div>
                                    <div className="large-3 columns input-info">
                                        <div className="add-btn-container"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="table-bottom row">
                        <div className="large-6 small-12 columns bottom-message term-and-policy">
                            By clicking create, I confirm that I have read and agree to the
                            <a href="https://www.ck12info.org/about/terms-of-use/"
                               target="_blank"
                               class="dxtrack-user-action"
                               data-dx-desc="roster_terms_of_use_link"
                               data-dx-referrer="roster_create_accounts_for_students_popup">
                               Terms of use
                            </a> and
                            <a href="https://www.ck12info.org/about/technology-2/privacy-policy/"
                               target="_blank"
                               class="dxtrack-user-action"
                               data-dx-desc="roster_privacy_policy_link"
                               data-dx-referrer="roster_create_accounts_for_students_popup"> Privacy Policy</a>.
                        </div>
                        <div className="large-2 small-12 columns">
                            {createBtn}
                        </div>
                    </div>
                </div>
            );
        }
    }
    return CreateAccount;
})();
