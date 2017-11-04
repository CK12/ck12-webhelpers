module.exports = (()=>{
    let CreateAccountRow =class CreatedAccountRow extends React.Component{
        constructor() {
            super();
        }
        render(){
            let iconClass = this.props.userInfo.status !== 0 ? 'icon-notification hide-for-small':'icon-validated hide-for-small for-row';

            let firstnameClass =  'large-3 columns input-info';
            if(this.props.userInfo.status === 'firstnameError'){
                firstnameClass += ' error-color';
            }

            let lastnameClass =  'large-3 columns input-info';
            if(this.props.userInfo.status === 'lastnameError'){
                lastnameClass += ' error-color';
            }

            let usernameClass =  'large-3 columns input-info';
            if(this.props.userInfo.status === 'usernameError'){
                usernameClass += ' error-color';
            }

            let passwordClass =  'large-3 columns input-info';
            if(this.props.userInfo.status === 'passwordError'){
                passwordClass += ' error-color';
            }

            let inputContainerClass = 'large-12 columns created-row';
            if(this.props.userInfo.status !== 0){
                inputContainerClass += ' with-error-message';
            }

            return(
                <div className="row">
                    <span className={this.props.hideIcon? 'hide': ' notification'}>
                        <i className={iconClass}></i>
                    </span>
                    <div className={inputContainerClass}>
                        <div className={firstnameClass}>
                            <span className="show-small input-label-small">First Name:</span>
                            {this.props.userInfo.firstname}
                        </div>
                        <div className={lastnameClass}>
                            <span className="show-small input-label-small">Last Name:</span>
                            {this.props.userInfo.lastname}
                        </div>
                        <div className= {usernameClass}>
                            <span className="show-small input-label-small">Username:</span>
                            {this.props.userInfo.username}
                        </div>
                        <div className={passwordClass}>
                            <span className="show-small input-label-small">Password:</span>
                            <input  className="no-input-style hide-for-small" type={this.props.showPassword?'text':'password'} value={this.props.userInfo.password} disabled></input>
                            <span className="show-small">{this.props.userInfo.password}</span>
                        </div>
                        <div className="large-12 columns error-message">
                            {this.props.userInfo.status !== 0 ? this.props.userInfo.errorMessage: null}
                        </div>
                    </div>
                </div>
            );
        }
    };
    return CreateAccountRow;
})();
