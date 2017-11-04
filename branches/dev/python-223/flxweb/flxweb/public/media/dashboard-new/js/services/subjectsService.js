import { get as GET } from 'services/methods';
import { Promise } from 'bluebird';
import defaultState from 'sources/subjectsDefault.js';

import { get, find } from 'lodash';

const CACHE = {
    localCache: {
        region: 'daily'
    }
};
export const getAllSubjects = () => GET('/taxonomy/collections/published?canonicalOnly=true', CACHE);

export const getSubjects = () => {
    return Promise.all([getAllSubjects()]).then(res => {
    	
    	var _obj = {
				MAT : "mathematics",
				ELA : "english",
				SCI : "science"
		}
    	
    	var _subjectsDefault =  defaultState;
    	(res[0].collections).forEach((element) => {
    		
    		var subject = _obj[element.parentSubjectID];
    		
    		_subjectsDefault[subject].branches.find((value, index) => {
    			if(element.title === 'Math Analysis'){
    				element.title = 'Analysis';
    			}
    			if(element.title === value.name){
    				_subjectsDefault[subject].branches[index].handle = element.handle;
    	    		_subjectsDefault[subject].branches[index].type = element.type;
    			}
    		})
    		
    			
    		
    	})
    	return _subjectsDefault;
    	/*var obj = {
    			mathematics : {
    				branchName : "Mathematics",
    				branches : []	
    			},
    			science : {
    				branchName : "Science",
    				branches : []
    			},
    			english : {
    				branchName : "English",
    				branches : []
    			}
    	};
    	
    	(res[0].collections).forEach((element) => {
    		var _obj = {
        			handle : element.handle,
        			name : element.title,
        			subject : {
        				name : "",
        				shortName: element.parentSubjectID
        			},
        			subjectID : element.parentSubjectID,
        			type: element.type
        	}
    		
    		switch(element.parentSubjectID){
    			case "MAT":
    				_obj.subject.name = "Mathematics";
    				obj.mathematics.branches.push(_obj);
    				break;
    			case "SCI":	
    				_obj.subject.name = "Science";;
    				obj.science.branches.push(_obj);
    				break;
    			case "ELA":	
    				_obj.subject.name = "English";
    				obj.english.branches.push(_obj);
    				break;
    		}
    	})*/
/*        return res.reduce( (obj, branch) => {
            let subjectName = get(branch, 'branches[0].subject.name', false);

            branch.branchName = subjectName;
            obj[subjectName.toLowerCase()] = branch;

            return obj;
        }, {});*/
    	//return obj;
    });
};


export default {
    getSubjects
};