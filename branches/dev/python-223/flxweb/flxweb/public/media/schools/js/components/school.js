'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
    'use strict';

    var React = require('react');
    var Book = require('./book');

    var School = function (_React$Component) {
        _inherits(School, _React$Component);

        function School() {
            _classCallCheck(this, School);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(School).apply(this, arguments));
        }

        _createClass(School, [{
            key: 'render',
            value: function render() {
                var books = this.props.books.map(function (book) {
                    return React.createElement(Book, { key: book.artifactID, bookInfo: book });
                });
                return React.createElement(
                    'div',
                    { className: 'school row collapse' },
                    React.createElement(
                        'div',
                        { className: 'column large-12 small-12' },
                        React.createElement(
                            'div',
                            { className: 'school_title row collapse' },
                            React.createElement(
                                'div',
                                { className: 'show-for-small' },
                                React.createElement(
                                    'a',
                                    { href: this.props.url },
                                    this.props.name
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'hide-for-small' },
                                React.createElement(
                                    'span',
                                    { className: 'left' },
                                    React.createElement(
                                        'a',
                                        { href: this.props.url },
                                        this.props.name
                                    )
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'right school-link' },
                                    React.createElement(
                                        'a',
                                        { href: '' },
                                        React.createElement(
                                            'span',
                                            null,
                                            'View School'
                                        ),
                                        React.createElement('span', { className: ' icon-arrow3_right right-side' })
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'row' },
                            books
                        )
                    )
                );
            }
        }]);

        return School;
    }(React.Component);

    return School;
});
//# sourceMappingURL=school.js.map
