//Common date utility methods
define(function () {
    'use strict';
    var date = {
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        getTimeDifference: function (timeString, presentTime) {
            var timeDiff, today, lastDay, activityTime, returnObj = {};
            activityTime = new Date(timeString).getTime();
            if (!activityTime) {
                return '';
            }
            today = presentTime ? new Date(presentTime) : new Date();
            timeDiff = today.getTime() - activityTime;
            timeDiff = Math.max(timeDiff, 0);
            timeDiff = Math.round(timeDiff / 60000);
            if (timeDiff / 60 < 1) {
                if (0 === timeDiff) {
                    returnObj.big = 'Just Now';
                    returnObj.small = 'Just Now';
                    return returnObj;
                }
                returnObj.big = 1 === timeDiff ? timeDiff + ' min ago' : timeDiff + ' mins ago';
                returnObj.small = timeDiff + 'm';
                return returnObj;
            }
            timeDiff = Math.round(timeDiff / 60);
            if (timeDiff / 24 < 1) {
                returnObj.big = 1 === timeDiff ? timeDiff + ' hour ago' : timeDiff + ' hours ago';
                returnObj.small = timeDiff + 'h';
                return returnObj;
            }
            timeDiff = Math.round(timeDiff / 24);
            lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            if (timeDiff / lastDay < 1) {
                returnObj.big = 1 === timeDiff ? timeDiff + ' day ago' : timeDiff + ' days ago';
                returnObj.small = timeDiff + 'd';
                return returnObj;
            }
            timeDiff = Math.round(timeDiff / lastDay);
            if (timeDiff / 12 < 1) {
                returnObj.big = 1 === timeDiff ? timeDiff + ' month ago' : timeDiff + ' months ago';
                returnObj.small = timeDiff + 'mo';
                return returnObj;
            }
            timeDiff = Math.round(timeDiff / 12);
            returnObj.big = 1 === timeDiff ? timeDiff + ' year ago' : timeDiff + ' years ago';
            returnObj.small = timeDiff + 'y';
            return returnObj;
        },
        getTimeInUserTimeZone: function (dateString) {
            var timeDiff,
                userMinutes,
                hours_12,
                presentTime_review,
                timeDiff_review,
                today_review,
                activityTime_review,
                userTimeHours,
                userDate,
                userTime = new Date(dateString),
                today = new Date();
            
            userMinutes = userTime.getMinutes();
            timeDiff = today.getTime() - userTime.getTime();
            timeDiff = Math.round(timeDiff / 60000);
            if (timeDiff / 60 < 1) {
                return 'Just Now';
            }
            hours_12 = userTime.getHours() % 12;
            activityTime_review = new Date(dateString).getTime();
            presentTime_review = new Date();
            today_review = presentTime_review ? new Date(presentTime_review) : new Date();
            timeDiff_review = today_review.getTime() - activityTime_review;
            timeDiff_review = Math.round(timeDiff_review / 60000);
            userTimeHours = userTime.getHours();
            if (userTime.setHours(0, 0, 0, 0) === presentTime_review.setHours(0, 0, 0, 0)) {
                if (hours_12 === 0) {
                    hours_12 = 12;
                }
                return 'Today, ' + (hours_12 < 10 ? '0' + hours_12 : hours_12) + (userMinutes < 10 ? ':0' + userMinutes : ':' + userMinutes) + (userTimeHours < 12 ? 'am' : 'pm');
            }
            userDate = userTime.getDate();
            return this.monthNames[userTime.getMonth()] + ' ' + (userDate < 10 ? '0' + userDate : userDate) + ', ' + userTime.getFullYear();

        }
    };

    return date;
});
