define( [
	'underscore'
	], function( _ ){

	var langMapping  = {
		INCORRECT_CREDENTIALS : 'Username/password incorrect',
		INVALID_EMAIL : 'Email not valid',
		EMAIL_REQUIRED : 'Email is required',
		INVALID_DATE : '{name} is invalid',
		MISSING_PASSWORD : 'Password missing',
		ALREADY_LOGGED_IN : 'User already logged in',
		UNKNOWN_MEMBER : 'member not registered',
		MEMBER_ALREADY_EXISTS : 'Email already exists',
		EMAIL_ALREADY_TAKEN : 'Email is already registered',
		CANNOT_CREATE_MEMBER : 'Technical Error',
		UNKOWN_ERROR : 'Unknown error',
		REQUIRED : '{name} is required',
		MIN_SIZE : '{name} cannot be less than {length} letters.',
		MAX_LENGTH : '{name} cannot be longer than {length} letters.',
		AT_LEAST_ONE_NUMBER : '{name} requires at least one number',
		SPECIAL_CHARS_NOT_ALLOWED : 'Special Characters are not allowed',
		ROLE_STUDENT : 'Student',
		ROLE_TEACHER : 'Teacher'
	};

	var keys  =  {};
	_.keys(langMapping).forEach( function ( value){
		 keys[value] = value;
	})

	return {
		keys : keys,
		getTextByKey : function(key){
			return langMapping[key] || key;
		},
		getDyanmicTextByKey : function(key, props){
			// TODO is pass props to make error msgs dynamic
			props =  props || {};

			if( !langMapping[key] ) return key;
			var text = langMapping[key];
			Object.keys( props ).forEach( function(propKey ){
					text =  text.replace( new RegExp('{'+ propKey+'}'), props[propKey] );
			});

			return text;
		}
	}
})