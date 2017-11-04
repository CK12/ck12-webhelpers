window.API_SERVER_NAME = "";
window.API_SERVER_HOST = window.API_SERVER_NAME;
window.webroot_url = "http://" + window.API_SERVER_NAME + "/";
window.API_SERVER_URL = "http://" + window.API_SERVER_NAME;
window.AUTH_SERVER_URL = "https://" + window.API_SERVER_NAME; 
window.practiceapp_mode = false;
var APP_VERSION=7887;
window.APP_VERSION = APP_VERSION;
window.isApp = function() {
    return window.practiceapp_mode;
}

// Branches to ignore when building the app
window.practiceAppIgnoreBranches = [];
window.practiceAppBranches = [
              	            {
            	                "bisac": "MAT004000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 16,
            	                "name": "Grade 1",
            	                "previewImageUrl": "",
            	                "shortname": "EM1",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Elementary Math",
            	                    "previewImageUrl": "",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT004000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 16,
            	                "name": "Grade 2",
            	                "previewImageUrl": "",
            	                "shortname": "EM2",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Elementary Math",
            	                    "previewImageUrl": "",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT004000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 16,
            	                "name": "Grade 3",
            	                "previewImageUrl": "",
            	                "shortname": "EM3",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Elementary Math",
            	                    "previewImageUrl": "",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT004000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 16,
            	                "name": "Grade 4",
            	                "previewImageUrl": "",
            	                "shortname": "EM4",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Elementary Math",
            	                    "previewImageUrl": "",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT004000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 16,
            	                "name": "Grade 5",
            	                "previewImageUrl": "",
            	                "shortname": "EM5",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Elementary Math",
            	                    "previewImageUrl": "",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT004000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 16,
            	                "name": "Arithmetic",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/arithmetic.jpg",
            	                "shortname": "ARI",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT020000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 17,
            	                "name": "Measurement",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/measurement.jpg",
            	                "shortname": "MEA",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT002000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 12,
            	                "name": "Algebra",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/algebra.jpg",
            	                "shortname": "ALG",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT012000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 13,
            	                "name": "Geometry",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/geometry.jpg",
            	                "shortname": "GEO",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT029000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 19,
            	                "name": "Probability",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/probability.jpg",
            	                "shortname": "PRB",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT029000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 18,
            	                "name": "Statistics",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/statistics.jpg",
            	                "shortname": "STA",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT032000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 15,
            	                "name": "Trigonometry",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/trigonometry.jpg",
            	                "shortname": "TRG",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT034000",
            	                "created": "2012-08-10 19:09:15",
            	                "description": null,
            	                "id": 20,
            	                "name": "Analysis",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/analyzing-function.jpg",
            	                "shortname": "ALY",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "MAT005000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 14,
            	                "name": "Calculus",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/calculus.png",
            	                "shortname": "CAL",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Mathematics",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/translations-rotations-and-reflections.jpg",
            	                    "shortname": "MAT",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "MAT",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "SCI019000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 10,
            	                "name": "Earth Science",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/earthscience.jpg",
            	                "shortname": "ESC",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Science",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/introduction-to-animals.jpg",
            	                    "shortname": "SCI",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "SCI",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "SCI086000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 11,
            	                "name": "Life Science",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/lifescience.jpg",
            	                "shortname": "LSC",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Science",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/introduction-to-animals.jpg",
            	                    "shortname": "SCI",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "SCI",
            	                "updated": "2013-02-27 19:58:36"
            	            },
            	            {
            	                "bisac": "SCI013050",
            	                "created": "2012-12-26 13:36:39",
            	                "description": null,
            	                "id": 21,
            	                "name": "Physical Science",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/physical-science.jpg",
            	                "shortname": "PSC",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Science",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/introduction-to-animals.jpg",
            	                    "shortname": "SCI",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "SCI",
            	                "updated": "2013-02-28 15:44:14"
            	            },
            	            {
            	                "bisac": "SCI008000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 6,
            	                "name": "Biology",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/biology.jpg",
            	                "shortname": "BIO",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Science",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/introduction-to-animals.jpg",
            	                    "shortname": "SCI",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "SCI",
            	                "updated": "2013-02-04 21:46:19"
            	            },
            	            {
            	                "bisac": "SCI013000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 7,
            	                "name": "Chemistry",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/chemistry.jpg",
            	                "shortname": "CHE",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Science",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/introduction-to-animals.jpg",
            	                    "shortname": "SCI",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "SCI",
            	                "updated": "2013-02-20 19:40:43"
            	            },
            	            {
            	                "bisac": "SCI055000",
            	                "created": "2012-06-08 22:38:20",
            	                "description": null,
            	                "id": 9,
            	                "name": "Physics",
            	                "previewImageUrl": "http://concepts.ck12.org/preview/physics.jpg",
            	                "shortname": "PHY",
            	                "subject": {
            	                    "created": "2012-06-08 22:38:20",
            	                    "description": null,
            	                    "name": "Science",
            	                    "previewImageUrl": "http://concepts.ck12.org/preview/introduction-to-animals.jpg",
            	                    "shortname": "SCI",
            	                    "updated": "2013-02-04 21:46:19"
            	                },
            	                "subjectID": "SCI",
            	                "updated": "2013-02-04 21:46:19"
            	            }
            	        ];
