import React from 'react';
import styles from 'scss/components/UserLocation';

import CK12LocationService from 'components/CK12LocationService';

const WORLD_TEXT = 'in the world';
const noLocationDefaults = {
    city: 'Somewhere',
    state: WORLD_TEXT,
    province: WORLD_TEXT,
    country: WORLD_TEXT
};

function getCountry(country){
    if(/:\s{1}/.test(country)){
        const _country = country.split(': ');
        return {
            abbr: _country[0],
            name: _country[1]
        };
    } else {
        return {
            abbr: noLocationDefaults.country,
            name: noLocationDefaults.country
        };
    }
}

function formatText({location}){
    const { city, state, province, country } = (location || noLocationDefaults);
    const _country = getCountry(country);
    if(city === null){
    	return null;
    }
    
    if(_country.abbr === 'US'){
        return `${city}, ${state || province}`;
    } else {
        return `${city}, ${_country.name}`;
    }
}


const ChangeLocationToggle = ({toggleLocation, isOpen, openText='Close', defaultText='Change Location'}) => {
    if(typeof toggleLocation !== 'function'){ return null; }

    return (
        <span className={styles.toggleLocation} onClick={toggleLocation}>{isOpen ? openText : defaultText}</span>
    );
};

const UserLocation = (props) => {
    const {isOpen, editOnHover} = props;
    const hoverClass = editOnHover ? styles.hoverShow : '';
    const locationText = formatText(props);
    if(locationText === null){    return (
        <div className={`${styles.userLocation}`}>
        <i className="dashboard-icon-location"></i><ChangeLocationToggle isOpen={true} {...props} />
        { isOpen ? <CK12LocationService {...props} /> : null }
        </div>
    )}
    return (
        <div className={`${styles.userLocation} ${hoverClass}`}>
            <i className="dashboard-icon-location"></i>{locationText} <ChangeLocationToggle {...props} />
            { isOpen ? <CK12LocationService {...props} /> : null }
        </div>
    );
};

export default UserLocation;