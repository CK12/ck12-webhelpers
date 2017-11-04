module.exports = (()=>{
    class AddClassRoster extends React.Component{
        constructor(){
            super();
        }
        render(){
            return(
                <div>
                    <div className="modal-container upload-class-roster">
                        <h3 className="title hide-for-small">Upload Class Roster</h3>
                        <h3 className="title show-for-small">Upload Class Roster</h3>
                        <div className="email-wrapper hide-for-small" ref={(emailTemplate)=> this.email = emailTemplate}>
                            <div className="question">How does this work?</div>
                            <div className="content example">You can send us a comma-separated value (CSV) file containing your students' information and we will create accounts for them. The CSV file should have the following format:</div>
                            <br></br>
                            <div className="content">"username","password","first name","last name","email"</div>
                            <div className="content example">Examples:</div>
                            <div className="content">"sarah jane","unique-password1","Sarah","Jane","sjane@mailprovider.com"</div>
                            <div className="content">"JohnSmith","unique-password2","John","Smith","jsmith@mailprovider.com"</div>
                            <br></br>
                            <div className="content">You can also download sample csv file
                                <a href={this.downloadLink} download='roster-class-upload-template.csv' target={navigator.msSaveBlob? '': '_blank'} href="https://static.ck12.org/roster/ck12-roster-class-upload-template.csv"> here </a>
                                and update it with your students' information.
                            </div>
                        </div>
                        <div className="email-wrapper-small show-for-small">
                            {/* <img src="/media/roster/images/email-invite.png" className=""></img> */}
                            <i className="icon-roster option-img"></i>
                        </div>
                        <div className="button-wrapper">
                            <a className="button tangerine standard copy-btn dxtrack-user-action"
                               data-dx-desc="roster_email_us_your_roster_button"
                               href="mailto:support@ck12.org"
                               target="_blank">
                               Email Us Your Roster
                            </a>
                        </div>
                    </div>
                </div>
            );
        }
    }
    return AddClassRoster;
})();
