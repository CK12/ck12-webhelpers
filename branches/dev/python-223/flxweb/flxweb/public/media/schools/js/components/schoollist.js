'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
    'use strict';

    var React = require('react');
    var School = require('./school');

    var SchoolList = function (_React$Component) {
        _inherits(SchoolList, _React$Component);

        function SchoolList() {
            _classCallCheck(this, SchoolList);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(SchoolList).apply(this, arguments));
        }

        _createClass(SchoolList, [{
            key: 'render',
            value: function render() {
                var schools = this.props.schools.map(function (school) {
                    return React.createElement(School, { key: school.id, name: school.name, url: school.url, books: school.books });
                });

                return React.createElement(
                    'div',
                    { className: 'content-wrap row' },
                    React.createElement(
                        'div',
                        null,
                        schools
                    )
                );
            }
        }]);

        return SchoolList;
    }(React.Component);

    return SchoolList;
});
//# sourceMappingURL=schoollist.js.map
