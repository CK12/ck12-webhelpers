const RecentlyViewed = ({
    currentLocation,
    showLocation,
    defaultOptions,
    login,
    onOptionClick
}) =>{
    return(
        <div>
            <li style={styles.currentLocation}
                className={showLocation? "dxtrack-user-action": "hide"}
                data-dx-desc="standard_dropdown_option"
                data-dx-eventname="FBS_STANDARDS"
                data-dx-standardName={currentLocation.longname||'California'}
                data-dx-standardboardid = {currentLocation.id||''}
                onClick={()=>onOptionClick(currentLocation)}
            ><i className="icon-map"></i><span style={styles.location}>{currentLocation.longname}</span></li>
            {defaultOptions.map(option =>(
                <li style={styles.li}
                    className="dxtrack-user-action"
                    data-dx-desc="standard_dropdown_option"
                    data-dx-eventname="FBS_STANDARDS"
                    data-dx-standardName={option.longname}
                    data-dx-standardboardid = {option.id}
                    key={'mr'+option.longname}
                    onClick={()=>onOptionClick(option)}
                >{option.longname}</li>
            ))}
        </div>
    );
};

const styles = {
    recentlyViewed:{
        padding: '10px 0 0 20px',
        color: '#585858',
        fontSize: '15px'
    },
    currentLocation:{
        paddingLeft: '15px',
        paddingTop: '6px'
    },
    location:{
        fontFamily: 'ProximaNova',
        paddingLeft: '5px',
	    textTransform: 'capitalize'
    },
    li:{
        marginTop: '5px',
        color: '#918f8f',
        textTransform: 'capitalize'
    }
};

export default RecentlyViewed;
