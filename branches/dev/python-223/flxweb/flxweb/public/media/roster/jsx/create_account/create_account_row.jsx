import Input from '../general_component/input_component.jsx';

module.exports = (()=>{
    class NewAccount extends React.Component{
        constructor() {
            super();
            this.state = {
                firstname: '',
                lastname: '',
                username:'',
                password:'',
                status: 0
            };
            this.handleInputChange = this.handleInputChange.bind(this);
            this.handleClick = this.handleClick.bind(this);
        }
        componentWillMount(){
            this.state.status = this.props.account.status || 0;
        }
        handleInputChange(fieldName, value, errorMessage){
            this.props.account[fieldName] = value;
            if(fieldName === 'username' || fieldName === 'password' || fieldName==='firstname'){
                if(errorMessage && errorMessage.length > 0){
                    this.props.account.errorMessage = errorMessage;
                    this.props.account.status = fieldName+'Error';
                }else{
                    this.props.account.errorMessage = '';
                    this.props.account.status = 0;
                }
            }
        }
        handleClick(){
            this.props.removeRow(this.props.account);
        }
        render(){
            let firstnameErrorMessage = '';
            let lastnameErrorMessage = '';
            let usernameErrorMessage = '';
            let passwordErrorMessage = '';

            if(this.state.status === 'passwordError'){   //invalid password
                passwordErrorMessage = this.props.account.errorMessage;
            }else if(this.state.status === 'usernameError'){ //invalid username
                usernameErrorMessage = this.props.account.errorMessage;
            }else if(this.state.status === 'firstnameError'){
                firstnameErrorMessage = this.props.account.errorMessage;
            }else if(this.state.status === 'lastnameError'){
                lastnameErrorMessage = this.props.account.errorMessage;
            }
            return(
                <div>
                    <div className="large-3 columns input-info">
                        <label className="show-for-small">First Name</label>
                        <Input type="text"
                               name="firstname"
                               maxLength="63"
                               required="true"
                               errorMessagePos="right"
                               enableCreateBtn={this.props.enableCreateBtn}
                               value={this.props.account.firstname}
                               errorMessage={firstnameErrorMessage}
                               handleChange={this.handleInputChange}/>
                    </div>
                    <div className="large-3 columns input-info">
                        <label className="show-for-small">Last Name(optional) </label>
                        <Input type="text"
                               name="lastname"
                               maxLength="63"
                               required="false"
                               errorMessagePos="right"
                               enableCreateBtn={this.props.enableCreateBtn}
                               value={this.props.account.lastname}
                               errorMessage={lastnameErrorMessage}
                               handleChange={this.handleInputChange}/>
                    </div>
                    <div className="large-3 columns input-info">
                        <label className="show-for-small">Unique Username</label>
                        <Input type="text"
                               name="username"
                               maxLength="128"
                               required="true"
                               enableCreateBtn={this.props.enableCreateBtn}
                               value={this.props.account.username}
                               errorMessage={usernameErrorMessage}
                               handleChange={this.handleInputChange}/>
                    </div>
                    <div className="large-3 columns input-info">
                        <label className="show-for-small">Password </label>
                        <Input type={this.props.showPassword? 'text': 'password'}
                               name="password"
                               maxLength="16"
                               required="true"
                               enableCreateBtn={this.props.enableCreateBtn}
                               value={this.props.account.password}
                               errorMessage={passwordErrorMessage}
                               handleChange={this.handleInputChange}/>
                        <span className="remove-btn-container">
                               <i className={this.props.hideRemoveBtn? 'icon-delete_cc remove-row hide':'icon-delete_cc remove-row dxtrack-user-action'}
                                  data-dx-desc="roster_remove_button"
                                  data-dx-referrer="roster_create_accounts_for_students_popup"
                                  onClick={this.handleClick}></i>
                               <div className="remove-tooltip">Remove</div>
                        </span>
                    </div>
                </div>
            );
        }
    }
    return NewAccount;
})();
