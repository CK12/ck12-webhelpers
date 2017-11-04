/**
 * Created by pratyush on 6/5/16.
 */
define([], function(){

    return  function(schoolName){
        return ['Hi CK-12 Team, \n',
        // 'I\'d like to claim the school page for ',schoolName,'.\n',
        'I\'d like to claim the school page for [school name].\n',
        '\n',
    'Name: \n',
    'Job Title:\n',
    'School Phone: \n',
    'School Website: \n'].join('')
    }
})