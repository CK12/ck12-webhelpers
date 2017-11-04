import RecentlyViewedSelection from '../containers/recentlyViewedSelection';
import AllOptions from '../containers/allOptions';
import React from 'react';

class Selections extends React.Component{
    constructor(){
        super();
        this.fetchOnce = false;
        this.fetchCurrentLocationforAnonymousOnce = false;
    }
    componentDidUpdate(nextPros){
        if(nextPros.data.login && !this.fetchOnce){
            this.fetchOnce = true;
            this.props.getCurrentLocation();
            this.props.getRecentStandards();
        }

        if(nextPros.data.login === false && !this.fetchCurrentLocationforAnonymousOnce && !this.fetchOnce){
            this.fetchCurrentLocationforAnonymousOnce = true;
            this.props.getLocationForAnonymousUser();
            this.props.getRecentStandards();
        }
    }
    render(){
        let {data,toggleOptionsVisibility,onOptionClick} = this.props;
        let options = null;
        if(data.complexSelection){
            options = (
                <div>
                    <RecentlyViewedSelection />
                    <AllOptions />
                </div>
            );
        }else{
            options = data.options.map(option=>(
                <li style={styles.li}
                    className="dxtrack-user-action"
                    data-dx-desc="standard_dropdown_option"
                    data-dx-eventname="FBS_STANDARDS"
                    data-dx-subject={option.longname||option.name}
                    data-dx-standardboardid = {data.standardBoardId}
                    key={option.longname||option.name}
                    onClick={()=>onOptionClick(option, data.selectedStandard, data.selectedSubject)}
                >{option.longname||option.name}</li>
            ));
        }
        return(
            <div style={styles.containerWrapper} className="single-select-container large-4 small-12 columns common-dropdown">
                <div style={styles.container} className={'container-'+data.label}>
                    <div style={styles.singleSelect}
                         className={data.disabled ? 'single-select disabled': 'single-select'}
                         onClick={(e)=> data.disabled? false : toggleOptionsVisibility(e)}>
                         {data.selected.longname? data.selected.longname: data.selected.name} <span className="arrow-down"></span>
                    </div>
                    <div className={data.showOptions? '': 'hide'} style={styles.optionsContainer}>
                        {/* <div style={styles.currentCountry}>{data.category1}</div> */}
                        <div style={data.complexSelection? styles.complexSelections: styles.simpleSlections}>
                            <ul style={styles.ul}>
                                {options}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const styles = {
    containerWrapper:{
        paddingBottom: '20px'
    },
    currentCountry:{
        color:'#666b64',
        padding: '4px 0 0 10px',
        fontSize: '15px'
    },
    container:{
        width: '100%',
        position: 'relative',
        zIndex:'23'
    },
    singleSelect:{
        width: '100%',
        height: '25px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        padding: '2px 0 0 13px',
        boxShadow: '0px 0px 4px -1px #9E9E9E',
        background: '#ffffff',
        overflow: 'hidden',
        textTransform: 'capitalize'
    },
    optionsContainer:{
        position:'absolute',
        width: '100%'
    },
    complexSelections:{
        width: '100%',
        position: 'absolute',
        maxHeight: '400px',
        top: '0',
        border: '1px solid #ccc',
        overflow: 'auto',
        borderRadius: '3px',
        boxShadow: '0px 0px 4px -1px #9E9E9E',
        zIndex: '100',
        background:'#ffffff'
    },
    simpleSlections:{
        width: '100%',
        position: 'absolute',
        maxHeight: '400px',
        border: '1px solid #ccc',
        overflow: 'auto',
        borderRadius: '3px',
        boxShadow: '0px 0px 4px -1px #9E9E9E',
        zIndex: '100',
        background:'#ffffff'
    },
    category:{
        paddingLeft:'10px'
    },
    ul:{
        padding: '0',
        margin: '0'
    },
    li:{
        textTransform: 'capitalize'
    }
};
export default Selections;
