define([
    'text!account/templates/account.main.html',
    'text!account/templates/groups.row.html'
],
function (account_main, groups_row) {
    'use strict';
    return {
        'account_main': account_main,
        'groups_row': groups_row
    };
});
