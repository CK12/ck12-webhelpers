'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
    'use strict';

    var React = require('react');

    var StateBanner = function (_React$Component) {
        _inherits(StateBanner, _React$Component);

        function StateBanner() {
            _classCallCheck(this, StateBanner);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(StateBanner).apply(this, arguments));
        }

        _createClass(StateBanner, [{
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    { id: 'schoolBanner', className: 'district-banner smooth-text' },
                    React.createElement(
                        'div',
                        { className: 'row school-banner-top-layer' },
                        React.createElement(
                            'div',
                            { className: 'column large-6 small-12 school-banner-header' },
                            React.createElement(
                                'div',
                                { className: 'row collapse' },
                                React.createElement(
                                    'span',
                                    null,
                                    'Schools'
                                ),
                                React.createElement('img', {
                                    className: 'heart-image',
                                    src: '/media/common/images/heart_throb_anim.gif' }),
                                React.createElement(
                                    'span',
                                    null,
                                    'CK-12,'
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row collapse' },
                                'and we love you too.'
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'school-banner-bottom-layer' },
                        React.createElement(
                            'div',
                            { className: 'row collapse home-image-wrapper' },
                            React.createElement('img', {
                                className: 'right home-image hide-for-small',
                                src: '/media/schools/images/school.png' }),
                            React.createElement('img', {
                                className: 'home-image show-for-small',
                                src: '/media/schools/images/school.png' })
                        )
                    )
                );
            }
        }]);

        return StateBanner;
    }(React.Component);

    return StateBanner;
});
//# sourceMappingURL=statebanner.js.map
