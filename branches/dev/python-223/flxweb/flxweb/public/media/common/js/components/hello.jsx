define( (require, exports, module) => {
    'use strict';

    var React = require('react');

    module.exports = React.createClass({
        displayName: 'HelloReact',
        render: () => {
            return (<div>Hello React.</div>)
        }
    })
});
