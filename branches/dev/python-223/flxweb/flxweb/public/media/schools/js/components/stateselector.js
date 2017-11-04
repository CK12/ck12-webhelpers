'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
    'use strict';

    var React = require('react');

    var StateSelectorDropdownItem = function (_React$Component) {
        _inherits(StateSelectorDropdownItem, _React$Component);

        function StateSelectorDropdownItem() {
            _classCallCheck(this, StateSelectorDropdownItem);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(StateSelectorDropdownItem).apply(this, arguments));
        }

        _createClass(StateSelectorDropdownItem, [{
            key: 'render',
            value: function render() {
                var stateInfo = this.props.stateInfo,
                    stateURL = '/r-schools/' + stateInfo.slug,
                    stateLinkID = 'lnk-state-' + stateInfo.slug;
                return React.createElement(
                    'li',
                    { 'data-value': stateInfo.slug, href: stateURL },
                    React.createElement(
                        'a',
                        {
                            id: stateLinkID,
                            className: 'statelink',
                            href: stateURL,
                            'data-value': stateInfo.slug },
                        stateInfo.name
                    )
                );
            }
        }]);

        return StateSelectorDropdownItem;
    }(React.Component);

    var StateSelector = function (_React$Component2) {
        _inherits(StateSelector, _React$Component2);

        function StateSelector() {
            _classCallCheck(this, StateSelector);

            return _possibleConstructorReturn(this, Object.getPrototypeOf(StateSelector).apply(this, arguments));
        }

        _createClass(StateSelector, [{
            key: 'render',
            value: function render() {
                var states = this.props.states;
                var selectedState = this.props.selectedState;
                var statesList,
                    stateSelectorContents = '';
                if (states) {
                    statesList = states.map(function (state) {
                        return React.createElement(StateSelectorDropdownItem, { key: state._id, stateInfo: state });
                    });
                    stateSelectorContents = React.createElement(
                        'div',
                        { className: 'large-3 columns large-centered small-10 small-centered' },
                        React.createElement(
                            'div',
                            { className: 'state-selection-wrapper' },
                            React.createElement(
                                'div',
                                {
                                    'data-dropdown': 'state-selection',
                                    className: 'button small split simple js-dropdown state-selected' },
                                React.createElement(
                                    'div',
                                    { className: 'state-label-wrapper text-left' },
                                    React.createElement('i', { className: 'icon-map' }),
                                    React.createElement(
                                        'label',
                                        { className: 'dropdown-label js-close-drop-down state-selected-label inline' },
                                        selectedState ? selectedState.name : ''
                                    )
                                ),
                                React.createElement('span', { className: 'js-close-drop-down' })
                            ),
                            React.createElement(
                                'ul',
                                {
                                    id: 'state-selection',
                                    className: 'f-dropdown tangerine-list simple state-selection',
                                    'data-dropdown-content': true },
                                statesList
                            )
                        )
                    );
                }
                return React.createElement(
                    'div',
                    { id: 'stateSelector' },
                    React.createElement(
                        'div',
                        {
                            name: 'states',
                            id: 'stateID',
                            className: 'state-select' },
                        stateSelectorContents
                    )
                );
            }
        }]);

        return StateSelector;
    }(React.Component);

    return StateSelector;
});
//# sourceMappingURL=stateselector.js.map
