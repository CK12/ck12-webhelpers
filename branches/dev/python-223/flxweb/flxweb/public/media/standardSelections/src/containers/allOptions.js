import { connect } from 'react-redux';
import AllOptions from '../components/allOptions';
import {toggleShowMoreStandards, selectAStandard} from '../actions/actions';

const mapStateToProps = (state) =>{
    let { currentLocation, recentStandards, standards, showMore} = state.standardOptions;

    let usStandardNames = ['CCSS', 'NGSS', 'NSES', 'NCTM'];
    let usStandards = standards.filter(standard => standard.countryCode === 'US');
    let internationStandards = standards.filter(standard => standard.countryCode === 'IN');
    var hideButton = false;

    if(!state.standardOptions.login){
        return {
            data: [
                {
                    category: 'United States',
                    standards: usStandards,
                },{

                    category: 'International',
                    standards: internationStandards
                }
            ],
            collapse: false,
            hideButton,
            login: state.standardOptions.login
        };
    }
    if(currentLocation.country){
        if(currentLocation.country.substring(0,2).toUpperCase() === 'US'){
            return {
                data: [
                    {
                        category: 'United States',
                        standards: usStandards,
                    },{

                        category: 'International',
                        generalStandards: [],
                        standards: internationStandards
                    }
                ],
                collapse: !showMore,
                hideButton,
                login: state.standardOptions.login
            };
        }else{
            if(recentStandards.length === 0){
                hideButton = true;
            }
            return{
                data: [
                    {
                        category: 'International',
                        standards: internationStandards
                    },
                    {
                        category: 'United States',
                        standards: usStandards,
                    }
                ],
                collapse: hideButton? false : !showMore,
                hideButton,
                login: state.standardOptions.login
            };
        }
    }
    return {
        data: [],
        collapse: true,
        hideButton,
        login: state.standardOptions.login
    };
};
const mapDispatchToProps = (dispatch) => {
    return{
        onOptionClick: (standard) => {
            if(standard.name === 'CBSE'){
                window.location.href = '/cbse/';
            }else{
                dispatch(selectAStandard(standard));
            }
        },
        showMore: ()=>{
            dispatch(toggleShowMoreStandards());
        }
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AllOptions);
