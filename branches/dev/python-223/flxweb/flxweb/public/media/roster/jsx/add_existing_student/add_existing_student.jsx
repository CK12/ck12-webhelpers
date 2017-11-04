import {getMyStudents, addStudentToGroup} from '../../services/roster.services';
module.exports = (()=>{
    let AddExistingStudentRow = require('./add_existing_student_row.jsx');
    class AddExistingStudent extends React.Component {
        constructor() {
            super();
            this.toggleAll = this.toggleAll.bind(this);
            this.toggleOne = this.toggleOne.bind(this);
            this.handleClick = this.handleClick.bind(this);

            this.uniqueKey = 0;
            this.state = {
                students: [],
                isAdding: false,
                all: false
            };
            this.checkedStudents = [];
        }
        toggleAll(event){
            let checked = event.target.checked;
            this.state.students.map((student)=>{
                student.checked = checked;
            });
            this.state.all = checked;
            this.setState(this.state);
        }
        toggleOne(event){
            if(event.target.checked){
                var notAll = this.state.students.some((student)=>{
                    return !student.checked && student.isMemberOf.indexOf(this.props.group.id) === -1;
                });
                if(!notAll){
                    this.state.all = true;
                    this.setState(this.state);
                }else{
                    if(this.state.all){
                        this.state.all = false;
                        this.setState(this.state);
                    }
                }
            }else{
                if(this.state.all){
                    this.state.all = false;
                    this.setState(this.state);
                }
            }
            this.setState(this.state);
        }
        handleClick(){
            this.setState({isAdding: true});
            let allPromises = [];
            this.selectedStudents.forEach((student)=>{
                if(student.checked){
                    let name = student.givenName+' ';
                    if(student.surname){
                        name += student.surname[0]+'.';
                    }
                    this.checkedStudents.push(name);
                    allPromises.push(addStudentToGroup({
                        groupID: this.props.group.id,
                        memberID: student.id
                    }));
                }
            });
            Promise.all(allPromises).then(()=>{
                this.props.goToView('add-existing-student-result', this.checkedStudents);
            });
        }
        componentWillMount(){
            getMyStudents({
                groupID: this.props.group.id,
                pageSize: 1000
            }).then((data)=>{
                this.setState(data);
            });
        }
        render(){
            this.selectedStudents = this.state.students.filter((student)=>{
                return student.checked === true && student.isMemberOf.indexOf(this.props.group.id) === -1;
            });
            let bottom = null;
            if(this.state.isAdding){
                bottom = (
                    <button className="button turquoise dxtrack-user-action"
                            data-dx-desc="roster_adding_button"
                            data-dx-referrer="roster_add_existing_students_popup">Add...</button>
                );
            }
            else if(this.selectedStudents.length > 0){
                bottom = (
                    <button className="button turquoise dxtrack-user-action"
                            data-dx-desc="roster_add_button"
                            data-dx-referrer="roster_add_existing_students_popup"
                            onClick={this.handleClick}>Add ({this.selectedStudents.length})</button>
                );
            }else{
                bottom = (
                    <button className="button grey disabled">Add</button>
                );
            }
            let allUsers = this.state.students.map((userInfo) =>{
                this.uniqueKey++;
                if(!userInfo.checked){
                    userInfo.checked = false;
                }
                return <AddExistingStudentRow key={this.uniqueKey} userInfo={userInfo} toggleOne={this.toggleOne} groupID={this.props.group.id}/>;
            });
            return(
                <div className="create-accounts-container">
                    <h3 className="title add-student">Add existing students</h3>
                    <div className="table-title-container row add-students">
                        <div className="large-12 columns">
                            <input type="checkbox"
                                   className="user-col check-all dxtrack-user-action"
                                   data-dx-desc="roster_select_all_students_checkbox"
                                   data-dx-referrer="roster_add_existing_students_popup"
                                   onChange={this.toggleAll}
                                   checked={this.state.all}></input>
                            <label className="user-col">Select all students</label>
                        </div>
                    </div>
                    <div className="table-content-container existing-student">
                        <div className="large-12 columns">
                            {allUsers}
                        </div>
                    </div>
                    <div className="table-bottom row">
                        {bottom}
                    </div>
                </div>
            );
        }
    }
    return AddExistingStudent;
})();
