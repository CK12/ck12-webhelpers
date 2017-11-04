define([
    'text!notification/templates/notification.main.html',
    'text!notification/templates/notification.item.html'
],
function(main,item){
    return {
        'NOTIFICATION_MAIN': main,
        'NOTIFICATION_ITEM': item
    };
});
