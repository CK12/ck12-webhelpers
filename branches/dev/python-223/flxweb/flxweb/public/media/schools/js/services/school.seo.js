define([], function(){
    'use strict';
    var SEO_INFO = {
        'california' : {
            title:'Online Textbooks for California Schools',
            description: 'Browse customized classroom materials in action across districts all over California with CK-12’s online textbooks for California schools.'
        },
        'florida' : {
            title:'Florida Schools Online Textbooks',
            description: 'Learn what schools in Florida are taking advantage of online textbooks and flexible lesson plans with our open flexbooks.'
        },
        'georgia': {
            title:'Online Textbooks Georgia School Districts',
            description: 'The CK-12 Foundation delivers digital resources straight to the classroom. View our free online textbooks in Georgia school districts.'
        },
        'texas': {
            title:'Online Textbooks for Texas Schools',
            description: 'Browse the districts and schools across Texas that are taking advantage of our custom flexbooks and online course materials.'
        }
    };
    return {
        getTitle: function(key){
            var title = '';
            if (SEO_INFO[key]){
                title = SEO_INFO[key].title;
            }
            return title;
        },
        getDescription: function(key){
            var desc = '';
            if (SEO_INFO[key]){
                desc = SEO_INFO[key].description;
            }
            return desc;  
        }
    };
});