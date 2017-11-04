/**
 * Created by pratyush on 6/5/16.
 */
define([
    'text!schools/templates/modals/editSchoolNamePopup.html',
    'text!schools/templates/modals/confirmClaimSchoolPopup.html',
    'text!schools/templates/modals/claimSchoolPopup.html',
    'text!schools/templates/modals/learnClaimSchool.html',
    'text!schools/templates/modals/embedCode.html'
], function(EDITSCHNAME, CONFIRMCLAIMPOPUP, CLAIMSCHOOLPOPUP,LEARNCLAIMSCHOOLPOPUP,SHOWEMBEDCODEPOPUP){
    return {
        "EDITSCHNAME": EDITSCHNAME,
        "CONFIRMCLAIMPOPUP":CONFIRMCLAIMPOPUP,
        'CLAIMSCHOOLPOPUP':CLAIMSCHOOLPOPUP,
        'LEARNCLAIMSCHOOLPOPUP':LEARNCLAIMSCHOOLPOPUP,
        'SHOWEMBEDCODEPOPUP' :SHOWEMBEDCODEPOPUP
    };
});