import { connect } from 'react-redux';
import Dropdown from '../components/dropdown';
import {
    showStandardOptions,
    getCurrentLocation,
    getRecentStandards,
    getCurrentLocationForAnonymousUser
} from '../actions/actions';

const mapStateToProps = (state) =>{
    let { currentLocation } = state.standardOptions;
    let category1 = 'United States';
    if(state.standardOptions.login && currentLocation.country && currentLocation.country.substring(0,2).toUpperCase() !== 'US'){
        category1 = 'International';
    }
    return {
        data: {
            ...state.standardOptions,
            category1,
            complexSelection: true,
            login: state.standardOptions.login,
            label: 'standard'
        }
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        toggleOptionsVisibility: () => {
            dispatch(showStandardOptions());
        },
        getCurrentLocation: () => {
            getCurrentLocation(dispatch);
        },
        getRecentStandards: () => {
            getRecentStandards(dispatch);
        },
        getLocationForAnonymousUser: ()=>{
            getCurrentLocationForAnonymousUser(dispatch);
        }
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dropdown);
