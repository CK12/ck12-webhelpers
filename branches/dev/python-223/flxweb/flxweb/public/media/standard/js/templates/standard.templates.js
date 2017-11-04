define([
        'text!standard/templates/info.ccss.html',
        'text!standard/templates/info.ngss.html',
        'text!standard/templates/standard.sets.html',
        'text!standard/templates/standard.main.html',
        'text!standard/templates/domain.list.html',
        'text!standard/templates/domain.title.html',
        'text!standard/templates/domain.details.html',
        'text!standard/templates/domain.detail.title.html',
        'text!standard/templates/standard.mobile.html'
    ],
    function (infoCCSS, infoNGSS, standardSets, standardMain, domainList, domainTitle, domainDetails, domainDetailTitle, standardMobile) {
        'use strict';
        return {
            'infoccss': infoCCSS,
            'infongss': infoNGSS,
            'standardSets': standardSets,
            'standardMain': standardMain,
            'domainList': domainList,
            'domainTitle': domainTitle,
            'domainDetails': domainDetails,
            'domainDetailTitle': domainDetailTitle,
            'standardMobile': standardMobile
        };
    });