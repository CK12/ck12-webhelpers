define([
    'common/utils/user'
], function (User){
    var currentUser;

    function get(){
        if(currentUser){
            return currentUser;
        }

        return User.getUser().done(function(user){
            currentUser = user;
            return currentUser;
        });
    }

    return {
        get: get
    };
});