import { connect } from 'react-redux';
import RecentlyViewed from '../components/recentlyViewed';
import stateNamesMapping from '../../data/stateNamesMapping';
import {selectAStandard} from '../actions/actions';

const mapStateToProps = (state) =>{
    let {standards, recentStandards, currentLocation} = state.standardOptions;

    let locationOption = standards.filter(standard =>{
        return standard.name.toUpperCase() === currentLocation.state.toUpperCase() || standard.longname.toUpperCase() === currentLocation.state.toUpperCase();
    });
    let topTwoStandards =[];
        if(locationOption.length > 0){
            topTwoStandards = recentStandards.filter(standard => standard.standardBoardID !== locationOption[0].id).slice(0,2).map(standard => parseInt(standard.standardBoardID));
        }else{
            topTwoStandards = recentStandards.slice(0,2).map(standard => parseInt(standard.standardBoardID));
        }
    let defaultOptions = standards.filter(standard => topTwoStandards.indexOf(standard.id) !== -1 );
    let showLocation = false;
    if(locationOption[0] && locationOption[0].countryCode.toUpperCase() === 'US'){
        showLocation = true;
    }
    return {
        currentLocation: locationOption[0] || {},
        showLocation,
        defaultOptions,
        login: state.standardOptions.login
    };
};
const mapDispatchToProps = (dispatch) => {
    return{
        onOptionClick: (standard) => {
            if(standard.name === 'CBSE' || Object.keys(standard).length === 0){
                window.location.href = '/cbse/';
            }else{
                dispatch(selectAStandard(standard));
            }
        }
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecentlyViewed);
