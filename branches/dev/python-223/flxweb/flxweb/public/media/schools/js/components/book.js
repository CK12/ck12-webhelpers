'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
    'use strict';

    var React = require('react');

    var Book = function (_React$Component) {
        _inherits(Book, _React$Component);

        function Book() {
            _classCallCheck(this, Book);

            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Book).call(this));

            _this.state = {
                flipped: false
            };
            _this.onMouseEnter = _this.onMouseEnter.bind(_this);
            _this.onMouseLeave = _this.onMouseLeave.bind(_this);
            return _this;
        }

        _createClass(Book, [{
            key: 'onMouseEnter',
            value: function onMouseEnter() {
                this.setState({ 'flipped': true });
            }
        }, {
            key: 'onMouseLeave',
            value: function onMouseLeave() {
                this.setState({ 'flipped': false });
            }
        }, {
            key: 'render',
            value: function render() {
                var book = this.props.bookInfo;

                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        { className: 'book columns large-3 medium-4 small-6 ' },
                        React.createElement(
                            'div',
                            {
                                className: 'bookWrap ' + (book.description ? '' : 'no-description') + ' ' + (this.state.flipped ? 'flipped' : ''),
                                onMouseEnter: this.onMouseEnter,
                                onMouseLeave: this.onMouseLeave
                            },
                            React.createElement(
                                'div',
                                { className: 'bookCover bookface front' },
                                React.createElement('img', { src: book.cover, 'data-pin-nopin': 'true' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'bookInfo bookface back' },
                                React.createElement(
                                    'div',
                                    { className: 'bookInfoTop' },
                                    React.createElement(
                                        'div',
                                        { className: 'bookDescription' },
                                        book.description
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'bookCreator' },
                                        React.createElement(
                                            'strong',
                                            null,
                                            'Created by: '
                                        ),
                                        React.createElement(
                                            'span',
                                            null,
                                            book.creatorName
                                        )
                                    )
                                ),
                                React.createElement(
                                    'a',
                                    { id: '"lnk-book-flipside-' + book.artifactID, className: 'bookLink', href: book.artifactPerma },
                                    'Open FlexBook ®'
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'bookTitle text-center' },
                            React.createElement(
                                'a',
                                { id: 'lnk-book-title-335823', className: 'bookLink', href: book.artifactPerma },
                                book.artifactTitle
                            ),
                            React.createElement(
                                'div',
                                { className: 'bookCreator' },
                                React.createElement(
                                    'span',
                                    null,
                                    book.creatorName
                                )
                            )
                        )
                    )
                );
            }
        }]);

        return Book;
    }(React.Component);

    return Book;
});
//# sourceMappingURL=book.js.map
