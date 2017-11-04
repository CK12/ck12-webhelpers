module.exports = (()=>{
    class AddExistingStudentResult extends React.Component{
        constructor() {
            super();
            this.namesString = '';
            this.goGroupMemeberPage = this.goGroupMemeberPage.bind(this);
        }
        goGroupMemeberPage(){
            window.location='/group-members/'+this.props.group.id;
        }
        componentWillMount(){
            let names = this.props.names;
            if(names.length === 1){
                this.namesString += names[0];
            }else if(names.length === 2){
                this.namesString += names[0]+' and '+names[1];
            }else if(names.length === 3){
                this.namesString += names[0]+', '+names[1]+', and '+names[2];
            }else{
                this.namesString += names[0]+', '+names[1]+', and '+ (names.length -2) + ' other students.';
            }
        }
        render(){
            return(
                <div className="add-existing-result-container">
                    <h3 className="title center"><i className="icon-validated"></i>Success!</h3>
                    <div className="table-content-container add-existing-student-result">
                        <div className="large-12 columns center">
                            <div>You have successfully added {this.props.names.length} students:</div>
                            <div className="added-student-names">{this.namesString}</div>
                            <a className="button turquoise view-btn existing dxtrack-user-action"
                               data-dx-desc="roster_view_students_button"
                               data-dx-referrer="roster_after_add_existing_student_popup"
                               onClick={this.goGroupMemeberPage}>View Students</a>
                        </div>
                    </div>
                </div>
            );
        }
    }
    return AddExistingStudentResult;
})();
