import {checkUsername} from '../../services/roster.services';
module.exports = (()=>{
    class Input extends React.Component {
        constructor() {
            super();
            this.state = {};
            this.handleChange = this.handleChange.bind(this);
            this.handleFocus = this.handleFocus.bind(this);
            this.handleBlur = this.handleBlur.bind(this);
            this.onErrorClick = this.onErrorClick.bind(this);
        }
        handleFocus(){
            if(this.state.errorMessage.length > 0){
                this.state.showErrorMessage = true;
            }
            this.setState(this.state);
        }
        handleChange(event){
            let inputInfo = event.target.value;
            this.props.handleChange(this.props.name, inputInfo);
            this.state.errorMessage = '';
            this.state.showErrorMessage = false;
            this.state.value = inputInfo;
            this.props.enableCreateBtn(inputInfo);
            this.setState(this.state);
        }
        handleBlur(event){
            let inputInfo = event.target.value;
            if(this.props.required === 'true'){
                if(inputInfo.length === 0){
                    this.setState({
                        showErrorMessage: false,
                        errorMessage: 'The field can not be empty'
                    });
                }else if(this.props.name === 'username' && inputInfo.length > 0){
                    if(inputInfo.length < 3){
                        this.setState({
                            showErrorMessage: false,
                            errorMessage:'Username needs to be at least 3 characters'
                        });
                    }else{
                        let hasSpecialChar = (!(/^((?=.*\d)|(?=.*\w)(?!").*)|[^\x00-\x80]+$/).test(inputInfo)) || (/[^\w\-]/gi).test(inputInfo);
                        if(hasSpecialChar){
                            this.setState({
                                showErrorMessage: false,
                                errorMessage:'Special Characters are not allowed'
                            });
                        }else{
                            checkUsername({login: inputInfo.trim()}).then((data)=>{
                                if(data.used){
                                    this.setState({
                                        showErrorMessage: false,
                                        errorMessage: 'The username is already taken'
                                    });
                                    this.props.handleChange(this.props.name, inputInfo, this.state.errorMessage);
                                }
                            });
                        }
                    }
                }else if(this.props.name === 'password'){
                    if(inputInfo.length < 6){
                        this.setState({
                            showErrorMessage: false,
                            errorMessage: 'Password needs to be at least 6 characters'
                        });
                    }else if(!/\d/.test(inputInfo.trim())){
                        this.setState({
                            showErrorMessage: false,
                            errorMessage: 'Password must contain at least one number'
                        });
                    }else{
                        this.setState({
                            showErrorMessage: false
                        });
                        this.props.handleChange(this.props.name, inputInfo, this.state.errorMessage);
                    }
                }else if(this.props.name === 'firstname'){
                    let hasSpecialChar = !(/^[^/\\()\[\]:~!@#$%^<>&|*]*$/).test(inputInfo);
                    if(hasSpecialChar){
                        this.setState({
                            showErrorMessage: false,
                            errorMessage:'Special Characters are not allowed'
                        });
                    }else{
                        this.setState({
                            showErrorMessage: false
                        });
                        this.props.handleChange(this.props.name, inputInfo, this.state.errorMessage);
                    }
                }
            }else{
                let hasSpecialChar = !(/^[^/\\()\[\]:~!@#$%^<>&|*]*$/).test(inputInfo);
                if(hasSpecialChar){
                    this.setState({
                        showErrorMessage: false,
                        errorMessage:'Special Characters are not allowed'
                    });
                }
            }
        }
        onErrorClick () {
            this._input.focus();
        }
        componentWillMount(){
            this.state.value = this.props.value;
            this.state.errorMessage = this.props.errorMessage;
            this.state.showErrorMessage = false;
        }
        render(){
            let error = this.state.errorMessage.length > 0;
            let errorMessage = null;
            if(this.state.showErrorMessage){
                let pos = this.props.errorMessagePos === 'right'? 'tooltip-error right hide-for-small': 'tooltip-error hide-for-small';
                errorMessage = (
                    <div className={this.state.showErrorMessage? pos: null}>
                        {this.state.errorMessage}
                    </div>
                );
            }
            return (
                <div className="small-12 columns">
                    <input type = {this.props.type}
                           name = {this.props.name}
                           value = {this.state.value}
                           onChange = {this.handleChange}
                           className={error? 'error-border': null}
                           onFocus = {this.handleFocus}
                           onBlur = {this.handleBlur}
                           maxLength = {this.props.maxLength}
                           ref={(c) => this._input = c}
                    />
                    {errorMessage}
                    <div className="error-message show-for-small">
                        {this.state.errorMessage}
                    </div>
                    <i onClick={this.onErrorClick} className={error? 'icon-notification': 'icon-notification hide'}></i>
                </div>
            );
        }
    }
    return Input;
})();
