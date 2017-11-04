define((require) => {
    'use strict';
    var React = require('react');
    class StateSelectorDropdownItem extends React.Component{
        render(){
            var stateInfo = this.props.stateInfo,
                stateURL = '/r-schools/' + stateInfo.slug,
                stateLinkID = 'lnk-state-' + stateInfo.slug;
            return (
                <li data-value={stateInfo.slug} href={stateURL}>
                    <a
                        id={stateLinkID}
                        className="statelink"
                        href={stateURL}
                        data-value={stateInfo.slug}>{stateInfo.name}</a>
                </li>
            );
        }
    }
    class StateSelector extends React.Component {
        render (){
            var states = this.props.states;
            var selectedState = this.props.selectedState;
            var statesList, stateSelectorContents = '';
            if (states){
                statesList = states.map( (state) => {
                    return (<StateSelectorDropdownItem key={state._id} stateInfo={state} />);
                });
                stateSelectorContents = (
                    <div className="large-3 columns large-centered small-10 small-centered">
                        <div className="state-selection-wrapper">
                            <div
                            data-dropdown="state-selection"
                            className="button small split simple js-dropdown state-selected">
                                <div className="state-label-wrapper text-left">
                                    <i className="icon-map" />
                                    <label className="dropdown-label js-close-drop-down state-selected-label inline">{selectedState?selectedState.name:''}</label>
                                </div>
                                <span className="js-close-drop-down" />
                            </div>
                            <ul
                                id="state-selection"
                                className="f-dropdown tangerine-list simple state-selection"
                                data-dropdown-content>
                                {statesList}
                            </ul>
                        </div>
                    </div>
                );
            }
            return (
                <div id="stateSelector">
                    <div
                    name="states"
                    id="stateID"
                    className="state-select">
                        {stateSelectorContents}
                    </div>
                </div>
            );
        }
    }
    return StateSelector;
});
