'use strict';

define(function (require, exports, module) {
    'use strict';

    var React = require('react');

    module.exports = React.createClass({
        displayName: 'HelloReact',
        render: function render() {
            return React.createElement(
                'div',
                null,
                'Hello React.'
            );
        }
    });
});
//# sourceMappingURL=hello.js.map
