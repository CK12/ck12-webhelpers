module.exports = (()=>{
    class AddExistingStudentRow extends React.Component{
        constructor() {
            super();
            this.handleChange = this.handleChange.bind(this);
        }
        handleChange(event){
            this.props.userInfo.checked = event.target.checked;
            this.props.toggleOne(event);
        }
        render(){
            return(
                <div className="row">
                    <div className="large-12 columns">
                        <div className={this.props.userInfo.checked && this.props.userInfo.isMemberOf.indexOf(this.props.groupID) === -1? 'info-container columns selected': 'info-container columns'}>
                            <input type="checkbox"
                                   className="user-col user-checkbox dxtrack-user-action"
                                   data-dx-desc="roster_select_a_student_checkbox"
                                   data-dx-referrer="roster_add_existing_student_popup"
                                   checked={this.props.userInfo.checked || this.props.userInfo.isMemberOf.indexOf(this.props.groupID)!==-1}
                                   onChange={this.handleChange}
                                   disabled={this.props.userInfo.isMemberOf.indexOf(this.props.groupID) === -1? false: true}
                                   ></input>
                            <div className="image-wrapper user-col">
                                <img src={'/auth/member/image/'+this.props.userInfo.studentID}></img>
                            </div>
                            <div className="user-col">
                                <div className="name">{this.props.userInfo.name}</div>
                                <div className="username">
                                    {this.props.userInfo.isMemberOf.indexOf(this.props.groupID) === -1 ? this.props.userInfo.login: 'Already a member'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
    return AddExistingStudentRow;
})();
