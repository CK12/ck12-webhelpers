define([
    'text!embed/templates/modality.details.html',
    'text!embed/templates/modality.details.download.html',
    'text!embed/templates/modality.details.link.html',
    'text!embed/templates/modality.details.embed.html',
    'text!embed/templates/modality.details.ilo.html',
    'text!embed/templates/concept.main.html',
    'text!embed/templates/modality.html',
    'text!embed/templates/modality_filter.html',
    'text!embed/templates/modality_launcher.html'
], function(md,mdd,mdl,mde,mdi,main,modality,filters,modality_launcher){
    'use strict';
    return {
        'MODALITY_DETAILS': md,
        'MODALITY_DETAILS_DOWNLOAD': mdd,
        'MODALITY_DETAILS_LINK': mdl,
        'MODALITY_DETAILS_EMBED': mde,
        'MODALITY_DETAILS_ILO': mdi,
        'CONCEPT_MAIN': main,
        'MODALITY': modality,
        'MODALITY_FILTERS': filters,
        'MODALITY_LAUNCHER': modality_launcher
    };
});
