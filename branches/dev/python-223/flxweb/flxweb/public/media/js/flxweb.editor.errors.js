// Editor errors
define(function () {
    'use strict';

    return {
        'ARTIFACT_ALREADY_EXISTS': {
            'message': 'This resource title is already used. Want to enter a new one?'
        },
        'BOOK_ALREADY_EXISTS': {
            'message': 'Something went wrong. We couldn\'t save this FlexBook&#174; because there is already a book with the same title. Want to enter a new title?',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204717840'
        },
        'BOOK_ALREADY_EXISTS_INBOX_ARCHIEVED': {
            'message': 'This FlexBook&#174; title is already used in your Inbox or Archive. Want to enter a new title?'
        },
        'CONCEPT_ALREADY_EXISTS': {
            'message': 'This resource title is already used. Want to enter a new one?',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204717800'
        },
        'EMPTY_ARTIFACT_TITLE': {
            'message': 'The title is empty or contains characters which are not supported by CK-12. Want to enter a new title?',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204575944'
        },
        'CHAPTER_ALREADY_EXISTS': {
            'message': 'This chapter title is already used. Want to enter a new one?',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204833870'
        },
        'ARTIFACT_NOT_LATEST': {
            'message': 'Heads up! The Concept you are trying to save is not latest. ',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204345084-Save-Error-Concept-you-are-trying-to-save-is-not-the-latest-'
        },
        'BOOK_NOT_LATEST': {
            'message': 'Heads up! The FlexBook&#174; you are trying to save is not latest.'
        },
        'CONCEPT_NOT_LATEST': {
            'message': 'Heads up! The Concept you are trying to save is not latest.',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204345084-Save-Error-Concept-you-are-trying-to-save-is-not-the-latest-'
        },
        'CHAPTER_NOT_LATEST': {
            'message': 'Heads up! The Chapter you are trying to save is not latest.'
        },
        'ARTIFACT_SAVE_UNKNOWN_ERROR': {
            'message': 'It looks like you\'re really stuck.',
            'CTA': 'Contact us so we can fix it.'
        },
        'BOOK_SAVE_UNKNOWN_ERROR': {
            'message': 'Something went wrong. Looks like we can\'t save your FlexBook&#174;. Please wait a moment and try again.',
            'CTA': 'Contact us so we can fix it.'
        },
        'ROSETTA_VALIDATION_FAILED': {
            'message': 'So sorry, your content didn\'t go through.',
            'faqLink': 'https://ck12support.zendesk.com/hc/en-us/articles/204861640'
        },
        'IMAGE_ENDPOINT_VALIDATION_FAILED': {
            'message': 'Image(s) got absolute URLs which are not allowed.'
        },
        'DUPLICATE_CHAPTER_TITLE': {
            'message': 'It looks like your chapters have the same title. Want to enter some unique titles?'
        },
        'ARTIFACT_SAVE_NOXHTML_ERROR': {
            'message': 'Seems like the area is empty. Try entering some content.'
        },
        'INVALID_ENCODEDID_DOMAINEID': {
            'message': 'Invalid domainEID or encodedID specified. Please correct and try again.'
        },
        'DUPLICATE_ENCODEDID': {
            'message': 'Duplicate entry for encodedID. Please change the encodedID and try again.'
        },
        'SAVE_FAIL_BOOK': {
            'message': 'Sorry, we just can\'t save your FlexBook&#174;.',
            'CTA': 'Contact us so we can fix it.'
        },
        'SAVE_FAIL_MODALITY': {
            'message': 'Sorry, we just can\'t save your <%= modality %> modality.',
            'CTA': 'Contact us so we can fix it.'
        },
        'LARGE_TEXT': {
            'message': 'Seems like your content is long. We suggest to breaking it down to multiple modalities.'
        },
        'INVALID_ENCODEDID_BRANCH': {
            'message': 'Branch and Language code must be 3 characters long in Encoded ID.'
        },
        'INVALID_ENCODEDID_CONCEPT': {
            'message': 'Concept code must be numeric of length 3 in Encoded ID.'
        },
        'INVALID_ENCODEDID_CONCEPT_DECIMAL': {
            'message': 'Decimal extension for concept code must be numeric in Encoded ID.'
        },
        'INVALID_ENCODEDID_J_VALUE': {
            'message': 'J value must be numeric in Encoded ID.'
        },
        'INVALID_ENCODEDID_FORMAT': {
            'message': 'Invalid Encoded ID format.'
        },
        'INVALID_HANDLE_LONG': {
            'message': 'Invalid Handle format. Handle cannot be more than 100 characters long.'
        },
        'INVALID_HANDLE_UNSAFE': {
            'message': 'Invalid Handle format. Url-unsafe characters are not allowed in handle.'
        },
        'VIDEO_MODALITY_WITHOUT_VIDEO': {
            'message': 'You are Saving a Video type Modality without Inserting a Video.'
        },
        '19001': {
            'message': 'You are saving a modality with older revision. Please edit the latest revision from library.',
            'BTN_TEXT' : 'OK, got it!'
        }
    };
});
