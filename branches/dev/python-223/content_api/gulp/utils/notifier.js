'use strict';

var notify = require('gulp-notify');

function handleError() {
  var args = Array.prototype.slice.call(arguments);

  return { errorHandler: function(){
            notify.onError({
              title: 'Error!',
              message: '<%= error %>'
              // appIcon: __dirname + '/error.png'
            }).apply(this, args);
            this.emit('end');
        }
    };
}

function handleSuccess(message) {
  return notify({
          title: 'Success!',
          message: message || 'You handle success very well',
          // appIcon: __dirname + '/success.png',
          sound: true
        });
}

module.exports = {
  success: handleSuccess,
  error: handleError
};