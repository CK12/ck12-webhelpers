define([
    'library/views/library.view'
], function(LibraryView){

    //DUMMY DATA
    var ITEMS = [{
        "domain": null,
        "creator": "Nachiket Karve",
        "labels": ["Mathematics", "Science"],
        "children": [2484271, 2484274],
        "contributor": null,
        "handle": "Book-3",
        "perma": "user:jaguarnac/book/Book-3/",
        "url_pdf": [],
        "url_epub": null,
        "feedbacks": {
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "count": 0,
                "average": 0
            },
            "voting": {
                "dislike": 0,
                "like": 0
            }
        },
        "revisions": [{
            "addedToLibrary": "2014-07-06 19:06:37",
            "comment": "",
            "attachments": [],
            "creator": "Nachiket Karve",
            "labels": [{
                "systemLabel": 1,
                "label": "Mathematics"
            }, {
                "systemLabel": 1,
                "label": "Science"
            }],
            "id": 2484275,
            "statistics": {
                "downloads": 0
            },
            "isFavorite": false,
            "title": "Book 3",
            "creatorAuthID": 32,
            "offset": 1,
            "children": [2484271, 2484274],
            "parents": [],
            "isLatest": true,
            "revision": "2",
            "artifactRevisionID": 2484275,
            "handle": "Book-3",
            "creatorID": 32,
            "authors": [{
                "roleID": 3,
                "sequence": 1,
                "role": "author",
                "name": "Nachiket Karve",
                "artifactID": 1661059
            }],
            "artifactID": 1661059,
            "resourceCounts": 0,
            "created": "2014-07-06T19:06:36-07:00",
            "summary": "",
            "encodedID": null,
            "pdf": [],
            "artifactType": "book"
        }],
        "coverImageThumbLarge": null,
        "realm": "user:jaguarnac",
        "resourceCounts": 0,
        "title": "Book 3",
        "coverImageThumbSmall": null,
        "standardGrid": {},
        "creatorAuthID": 32,
        "exerciseCount": 0,
        "id": 1661059,
        "gradeGrid": [],
        "handle-encoded": true,
        "subjectGrid": [],
        "internalTagGrid": [],
        "messageToUsers": "",
        "isLatest": true,
        "type": {
            "modality": false,
            "extensionType": "FB",
            "description": "The book artifact (student or default edition)",
            "name": "book",
            "id": 1
        },
        "searchGrid": [],
        "revision": "2",
        "artifactRevisionID": 2484275,
        "lastRead": null,
        "isModality": 0,
        "revisionInLibrary": 2484275,
        "hasXhtml": false,
        "foundationGrid": [],
        "stateGrid": [],
        "extendedArtifacts": {},
        "creatorID": 32,
        "authors": [{
            "roleID": 3,
            "sequence": 1,
            "role": "author",
            "name": "Nachiket Karve",
            "artifactID": 1661059
        }],
        "level": null,
        "artifactID": 1661059,
        "latestRevision": "2",
        "contributed_by": "Community Contributed",
        "license": null,
        "tagGrid": [],
        "coverImage": null,
        "created": "2014-07-06T19:06:04-07:00",
        "latestRevisionID": 2484275,
        "modified": "2014-07-06T19:06:37-07:00",
        "summary": "",
        "encodedID": null,
        "artifactType": "book",
        "url_mobi": null
    }, {
        "domain": null,
        "creator": "Nachiket Karve",
        "labels": ["Mathematics", "Science"],
        "children": [2484271],
        "contributor": null,
        "handle": "Book-1",
        "perma": "user:jaguarnac/book/Book-1/",
        "url_pdf": [],
        "url_epub": null,
        "feedbacks": {
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "count": 0,
                "average": 0
            },
            "voting": {
                "dislike": 0,
                "like": 0
            }
        },
        "revisions": [{
            "addedToLibrary": "2014-07-06 19:05:34",
            "comment": "",
            "attachments": [],
            "creator": "Nachiket Karve",
            "labels": [{
                "systemLabel": 1,
                "label": "Mathematics"
            }, {
                "systemLabel": 1,
                "label": "Science"
            }],
            "id": 2484272,
            "statistics": {
                "downloads": 0
            },
            "isFavorite": false,
            "title": "Book 1",
            "creatorAuthID": 32,
            "offset": 2,
            "children": [2484271],
            "parents": [],
            "isLatest": true,
            "revision": "3",
            "artifactRevisionID": 2484272,
            "handle": "Book-1",
            "creatorID": 32,
            "authors": [{
                "roleID": 3,
                "sequence": 1,
                "role": "author",
                "name": "Nachiket Karve",
                "artifactID": 1661056
            }],
            "artifactID": 1661056,
            "resourceCounts": 0,
            "created": "2014-07-06T19:05:33-07:00",
            "summary": "",
            "encodedID": null,
            "pdf": [],
            "artifactType": "book"
        }],
        "coverImageThumbLarge": null,
        "realm": "user:jaguarnac",
        "resourceCounts": 0,
        "title": "Book 1",
        "coverImageThumbSmall": null,
        "standardGrid": {},
        "creatorAuthID": 32,
        "exerciseCount": 0,
        "id": 1661056,
        "gradeGrid": [],
        "handle-encoded": true,
        "subjectGrid": [],
        "internalTagGrid": [],
        "messageToUsers": "",
        "isLatest": true,
        "type": {
            "modality": false,
            "extensionType": "FB",
            "description": "The book artifact (student or default edition)",
            "name": "book",
            "id": 1
        },
        "searchGrid": [],
        "revision": "3",
        "artifactRevisionID": 2484272,
        "lastRead": "2014-07-06 19:05:16",
        "isModality": 0,
        "revisionInLibrary": 2484272,
        "hasXhtml": false,
        "foundationGrid": [],
        "stateGrid": [],
        "extendedArtifacts": {},
        "creatorID": 32,
        "authors": [{
            "roleID": 3,
            "sequence": 1,
            "role": "author",
            "name": "Nachiket Karve",
            "artifactID": 1661056
        }],
        "level": null,
        "artifactID": 1661056,
        "latestRevision": "3",
        "contributed_by": "Community Contributed",
        "license": null,
        "tagGrid": [],
        "coverImage": null,
        "created": "2014-07-06T18:36:00-07:00",
        "latestRevisionID": 2484272,
        "modified": "2014-07-06T19:05:34-07:00",
        "summary": "",
        "encodedID": null,
        "artifactType": "book",
        "url_mobi": null
    }, {
        "domain": null,
        "creator": "Nachiket Karve",
        "labels": [],
        "children": [1409733],
        "contributor": null,
        "handle": "Book-2",
        "perma": "user:jaguarnac/book/Book-2/",
        "url_pdf": [],
        "url_epub": null,
        "feedbacks": {
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "count": 0,
                "average": 0
            },
            "voting": {
                "dislike": 0,
                "like": 0
            }
        },
        "revisions": [{
            "addedToLibrary": "2014-07-06 19:03:49",
            "comment": "",
            "attachments": [],
            "creator": "Nachiket Karve",
            "labels": [],
            "id": 2484269,
            "statistics": {
                "downloads": 0
            },
            "isFavorite": false,
            "title": "Book 2",
            "creatorAuthID": 32,
            "offset": 0,
            "children": [1409733],
            "parents": [],
            "isLatest": true,
            "revision": "1",
            "artifactRevisionID": 2484269,
            "handle": "Book-2",
            "creatorID": 32,
            "authors": [{
                "roleID": 3,
                "sequence": 1,
                "role": "author",
                "name": "Nachiket Karve",
                "artifactID": 1661057
            }],
            "artifactID": 1661057,
            "resourceCounts": 0,
            "created": "2014-07-06T19:03:49-07:00",
            "summary": "",
            "encodedID": null,
            "pdf": [],
            "artifactType": "book"
        }],
        "coverImageThumbLarge": null,
        "realm": "user:jaguarnac",
        "resourceCounts": 0,
        "title": "Book 2",
        "coverImageThumbSmall": null,
        "standardGrid": {},
        "creatorAuthID": 32,
        "exerciseCount": 0,
        "id": 1661057,
        "gradeGrid": [],
        "handle-encoded": true,
        "subjectGrid": [],
        "internalTagGrid": [],
        "messageToUsers": "",
        "isLatest": true,
        "type": {
            "modality": false,
            "extensionType": "FB",
            "description": "The book artifact (student or default edition)",
            "name": "book",
            "id": 1
        },
        "searchGrid": [],
        "revision": "1",
        "artifactRevisionID": 2484269,
        "lastRead": null,
        "isModality": 0,
        "revisionInLibrary": 2484269,
        "hasXhtml": false,
        "foundationGrid": [],
        "stateGrid": [],
        "extendedArtifacts": {},
        "creatorID": 32,
        "authors": [{
            "roleID": 3,
            "sequence": 1,
            "role": "author",
            "name": "Nachiket Karve",
            "artifactID": 1661057
        }],
        "level": null,
        "artifactID": 1661057,
        "latestRevision": "1",
        "contributed_by": "Community Contributed",
        "license": null,
        "tagGrid": [],
        "coverImage": null,
        "created": "2014-07-06T19:03:49-07:00",
        "latestRevisionID": 2484269,
        "modified": "2014-07-06T19:03:59-07:00",
        "summary": "",
        "encodedID": null,
        "artifactType": "book",
        "url_mobi": null
    }];
    var LABELS = [{
        "member": null,
        "systemLabel": 1,
        "created": "2012-02-22T18:39:53-08:00",
        "id": "TWF0aGVtYXRpY3M.",
        "label": "Mathematics"
    }, {
        "member": null,
        "systemLabel": 1,
        "created": "2012-02-22T18:39:53-08:00",
        "id": "U2NpZW5jZQ..",
        "label": "Science"
    }, {
        "member": null,
        "systemLabel": 1,
        "created": "2012-02-22T18:39:53-08:00",
        "id": "T3RoZXJz",
        "label": "Others"
    }, {
        "member": "jaguarnac",
        "systemLabel": 0,
        "created": "2012-07-30T11:25:51-07:00",
        "id": "TWlncmF0ZWQ.",
        "label": "Migrated"
    }, {
        "member": "jaguarnac",
        "systemLabel": 0,
        "created": "2012-05-06T23:41:43-07:00",
        "id": "bXlmaWxlcw..",
        "label": "myfiles"
    }];
    
    describe("LibraryView Tests", function(){
        it("LibraryView exists", function(){
            LibraryView.should.exist;
        });
    });

});