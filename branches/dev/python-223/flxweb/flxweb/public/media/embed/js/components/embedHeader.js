'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require, exports, module) {
    'use strict';

    var React = require('react');

    var EmbedHeader = function (_React$Component) {
        _inherits(EmbedHeader, _React$Component);

        function EmbedHeader(props) {
            _classCallCheck(this, EmbedHeader);

            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EmbedHeader).call(this, props));

            _this.headerStyles = {
                'height': '51px',
                'backgroundColor': '#FFFFFF'
            };
            return _this;
        }

        _createClass(EmbedHeader, [{
            key: 'render',
            value: function render() {
                return React.createElement(
                    'header',
                    { className: 'header embedded', style: this.headerStyles },
                    React.createElement(
                        'nav',
                        { className: 'top-bar row top-nav' },
                        React.createElement(
                            'a',
                            { id: 'embed_nav_logo', href: '/' },
                            React.createElement('img', { className: 'logo-img', src: '/media/common/images/logo_ck12_medium.png' })
                        ),
                        React.createElement(
                            'div',
                            { className: 'right' },
                            React.createElement(
                                'a',
                                { title: 'View on www.ck12.org', target: '_blank', id: 'lnk_ext', href: '/algebra/order-of-operations/' },
                                React.createElement(
                                    'span',
                                    null,
                                    'View this on CK12.org'
                                ),
                                React.createElement('i', { className: 'icon-open_new_window' })
                            )
                        )
                    )
                );
            }
        }]);

        return EmbedHeader;
    }(React.Component);

    module.exports = EmbedHeader;
});
//# sourceMappingURL=embedHeader.js.map
