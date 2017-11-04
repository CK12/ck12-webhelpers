define([
        'text!profilebuilder/templates/grades.row.html',
        'text!profilebuilder/templates/member.information.html',
        'text!profilebuilder/templates/profile.builder.html',
        'text!profilebuilder/templates/share.registration.email.html'
    ], function(GR, MI, PB, SRE){
        return {
            'GRADES_ROW': GR,
            'MEMBER_INFORMATION': MI,
            'PROFILE_BUILDER': PB,
            'SHARE_REGISTRATION_EMAIL': SRE
        };
    });
