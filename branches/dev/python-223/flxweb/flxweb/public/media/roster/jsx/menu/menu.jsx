import MenuOption from './menu_option.jsx';
module.exports = (()=>{
    class Menu extends React.Component {
        constructor(){
            super();
            // this.goToEmailInvite = this.goToEmailInvite.bind(this);
            let csv = 'sarahjane,unique-password1,Sarah,Jane,sjane@mailprovider.com\njohnsmith,unique-password2,John,Smith,jsmith@mailprovider.com\n',
                blob = new Blob([csv], { type: 'text/csv;charset=utf-8;'});
            this.blob = blob;
            this.downloadLink = URL.createObjectURL(blob);
        }
        goToView(targetView){
            this.props.goToView(targetView);
        }
        downloadCSV(event){
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(this.blob, 'roster-class-upload-template.csv');
            }
        }
        render(){
            let { goToView, disabledOneView } = this.props;
            return (
                <div className="modal-container">
                    <h3 className="title"> Add Students </h3>
                    <div className="subtitle">Add or Invite students into your group to assign homework and track progress</div>
                    <MenuOption icon="icon-email"
                                text="Invite students by email"
                                textSmall="Invite students"
                                dataDxDesc="roster_invite_students_button"
                                dataDxReferrer="roster_add_students_popup"
                                navigateTo={goToView}
                                targetView="email-invite"
                                showDividerLine/>
                    <MenuOption icon="icon-add-members"
                                text="Add Students without email"
                                textSmall="Create account"
                                dataDxDesc="roster_create_account_button"
                                dataDxReferrer="roster_add_students_popup"
                                navigateTo={goToView}
                                targetView="create-account"/>
                    <MenuOption icon="icon-students"
                                text="Find existing students"
                                textSmall="Add students"
                                dataDxDesc="roster_add_students_button"
                                dataDxReferrer="roster_add_students_popup"
                                navigateTo={goToView}
                                targetView="add-existing-student"
                                showDividerLine
                                disabled = {disabledOneView}/>
                    <MenuOption icon="icon-roster smaller-icon"
                                text="Upload class roster"
                                dataDxDesc="roster_upload_class_button"
                                dataDxReferrer="roster_add_students_popup"
                                navigateTo={goToView}
                                targetView="upload-class-roster"/>
                </div>
            );
        }
    }
    return Menu;
})();
