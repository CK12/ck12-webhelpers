define([
    'text!modality/templates/modality.details.html',
    'text!modality/templates/modality.details.download.html',
    'text!modality/templates/modality.details.link.html',
    'text!modality/templates/modality.details.embed.html',
    'text!modality/templates/modality.details.ilo.html',
    'text!modality/templates/concept.main.html',
    'text!modality/templates/modality.html',
    'text!modality/templates/modality_filter.html',
    'text!modality/templates/concept.info.top.html',
    'text!modality/templates/concept.filters.top.html',
    'text!modality/templates/concept.dropdown.html',
    'text!modality/templates/practice.badge.html',
    'text!modality/templates/concept.contribute.html',
    'text!modality/templates/featured.content.html',
    'text!modality/json/modality_config.json'
], function (md, mdd, mdl, mde, mdi, cm, modality, filters, cit, cft, cd, pb, cc, fc, modalityConfig) {
    'use strict';
    return {
        'MODALITY_DETAILS': md,
        'MODALITY_DETAILS_DOWNLOAD': mdd,
        'MODALITY_DETAILS_LINK': mdl,
        'MODALITY_DETAILS_EMBED': mde,
        'MODALITY_DETAILS_ILO': mdi,
        'CONCEPT_MAIN': cm,
        'MODALITY': modality,
        'MODALITY_FILTERS': filters,
        'CONCEPT_INFO_TOP': cit,
        'CONCEPT_FILTERS_TOP': cft,
        'CONCEPT_DROPDOWN': cd,
        'PRACTICE_BADGE': pb,
        'CONCEPT_CONTRIBUTE': cc,
        'FEATURED_CONTENT': fc,
        'MODALITY_CONFIG': modalityConfig
    };
});
