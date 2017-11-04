'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require, exports, module) {
    'use strict';

    var React = require('react');
    var EmbedHeader = require('./embedHeader');

    var Book = function (_React$Component) {
        _inherits(Book, _React$Component);

        function Book() {
            _classCallCheck(this, Book);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(Book).apply(this, arguments));
        }

        _createClass(Book, [{
            key: 'render',
            value: function render() {
                var chapterContainerStyles = {
                    padding: 10
                };
                var book = this.props.book;

                var _book$revisions = _slicedToArray(book.revisions, 1);

                var children = _book$revisions[0].children;

                var bookChildren = children.map(function (child, idx) {
                    return React.createElement(ChapterInfoRow, { key: child.artifactID, chapter: child, index: idx + 1 });
                });
                return React.createElement(
                    'div',
                    null,
                    React.createElement(BookInfoRow, { book: book }),
                    React.createElement(
                        'div',
                        { className: 'container', style: chapterContainerStyles },
                        bookChildren
                    )
                );
            }
        }]);

        return Book;
    }(React.Component);

    var ChapterInfoRow = function (_React$Component2) {
        _inherits(ChapterInfoRow, _React$Component2);

        function ChapterInfoRow() {
            _classCallCheck(this, ChapterInfoRow);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(ChapterInfoRow).apply(this, arguments));
        }

        _createClass(ChapterInfoRow, [{
            key: 'render',
            value: function render() {
                var chapter = this.props.chapter;

                return React.createElement(
                    'div',
                    { className: 'clearfix' },
                    React.createElement(
                        'div',
                        { className: 'text-right large-1 small-1 column' },
                        this.props.index
                    ),
                    React.createElement(
                        'div',
                        { className: 'column large-11, small-11' },
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'strong',
                                null,
                                chapter.title
                            )
                        )
                    )
                );
            }
        }]);

        return ChapterInfoRow;
    }(React.Component);

    var BookInfoRow = function (_React$Component3) {
        _inherits(BookInfoRow, _React$Component3);

        function BookInfoRow() {
            _classCallCheck(this, BookInfoRow);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(BookInfoRow).apply(this, arguments));
        }

        _createClass(BookInfoRow, [{
            key: 'render',
            value: function render() {
                var _props$book = this.props.book;
                var coverImage = _props$book.coverImage;
                var title = _props$book.title;
                var gradeGrid = _props$book.gradeGrid;
                var summary = _props$book.summary;
                var creator = _props$book.creator;

                var bookHeaderStyles = {
                    marginTop: 25
                };
                var grades = gradeGrid.map(function (grade) {
                    return grade[1];
                }).join(', ');
                return React.createElement(
                    'div',
                    { className: 'container clearfix', style: bookHeaderStyles },
                    React.createElement(
                        'div',
                        { className: 'columns small-3 large-3' },
                        React.createElement(BookCover, { src: coverImage })
                    ),
                    React.createElement(
                        'div',
                        { className: 'columns small-9 large-9' },
                        React.createElement(
                            'h2',
                            null,
                            title
                        ),
                        React.createElement(
                            'div',
                            null,
                            summary
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'strong',
                                null,
                                'Created By: '
                            ),
                            creator
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'strong',
                                null,
                                'Grades: '
                            ),
                            grades
                        )
                    )
                );
            }
        }]);

        return BookInfoRow;
    }(React.Component);

    var BookCover = function (_React$Component4) {
        _inherits(BookCover, _React$Component4);

        function BookCover() {
            _classCallCheck(this, BookCover);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(BookCover).apply(this, arguments));
        }

        _createClass(BookCover, [{
            key: 'render',
            value: function render() {
                var src = this.props.src;
                if (src.indexOf('THUMB_POSTCARD') === -1) {
                    src = src.replace(/cover%20page/, 'THUMB_POSTCARD/cover%20page');
                }
                return React.createElement('img', { src: src });
            }
        }]);

        return BookCover;
    }(React.Component);

    var BookEmbedView = function (_React$Component5) {
        _inherits(BookEmbedView, _React$Component5);

        function BookEmbedView() {
            _classCallCheck(this, BookEmbedView);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(BookEmbedView).apply(this, arguments));
        }

        _createClass(BookEmbedView, [{
            key: 'render',
            value: function render() {

                var header = React.createElement(EmbedHeader, null),
                    content = null;
                console.log(this);
                if (!this.props.book) {
                    content = React.createElement(
                        'div',
                        null,
                        ' Fetching Book... '
                    );
                } else {
                    content = React.createElement(
                        'div',
                        null,
                        React.createElement(Book, { book: this.props.book })
                    );
                }
                return React.createElement(
                    'div',
                    null,
                    header,
                    React.createElement(
                        'div',
                        null,
                        content
                    )
                );
            }
        }]);

        return BookEmbedView;
    }(React.Component);

    module.exports = BookEmbedView;
});
//# sourceMappingURL=embed.js.map
