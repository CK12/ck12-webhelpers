/* global google:false */

import React, {Component, PropTypes} from 'react';
import { Promise } from 'bluebird';

import { isEmpty, includes, has } from 'lodash';

export default class CK12LocationService extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: {}
        };

        this.initAutocomplete = this.initAutocomplete.bind(this);
        this.changeAddress = this.changeAddress.bind(this);
        this.getUserLocation = this.getUserLocation.bind(this);
    }

    componentDidMount(){
        const { country } = this.props;
        this.initAutocomplete(country);
    }

    changeAddress(address={}){
        return new Promise((resolve)=>{
            this.setState(
                Object.assign({}, this.state, {
                    address: address
                }),
                ()=>resolve(this.getUserLocation())
            );
        });
    }

    getUserLocation(){
        return this.state.address;
    }

    initAutocomplete(country){
        const { locationChangedCallback } = this.props;
        const { locationInput } = this.refs;

        const changeAddress = this.changeAddress;

       //Bug: 55338 google maps api not allowing empty value of 'country' attribute. 
        var options = {
        	types: ['(regions)']	
        }
        if(country) {
        	options = {
        		types: ['(regions)'],
        		componentRestrictions: {country}
        	};
        }	
        const autocomplete = new google.maps.places.Autocomplete(locationInput, options);

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            changeAddress().then((_address)=>{
                var address = Object.assign({}, _address),
                    place   = autocomplete.getPlace();

                if ('address_components' in place) {
                    var addrc = place.address_components;

                    for (var i = 0; i < addrc.length; i++) {
                        var c = addrc[i];
                        if ((includes(c.types, 'administrative_area_level_2')) && !address.city) {
                            address.city = c.long_name;
                        }
                        if ((includes(c.types, 'locality') || (!includes(c.types, 'locality') && includes(c.types, 'sublocality'))) && !address.city ){
                            address.city = c.long_name;
                        }
                        if (includes(c.types, 'postal_code')) {
                            address.zip = c.long_name;
                        }
                        if (includes(c.types, 'administrative_area_level_1')) {
                            address.state = c.short_name;
                            address.province = c.long_name;
                        }
                        if (includes(c.types, 'country')) {
                            address.country = c.short_name + ': ' + c.long_name;
                        }
                    }

                    if (!isEmpty(address) && (has(address, 'city')) && (has(address, 'country'))) {

                        changeAddress(address).then((_address)=>{
                            if(typeof locationChangedCallback === 'function'){
                                locationChangedCallback(_address);
                            }
                        });

                    }
                    else {
                        if(!has(address, 'city')){
                            alert('Please make sure the address being used is a city.')
                        } else {
                            // TODO: If possible, customize this msg for actual field name.
                            alert('Could not determine address');
                        }
                    }
                }
            });
        });

        locationInput.focus();
    }


    render() {
        return (
            <input type="text" ref="locationInput" ></input>
        );
    }
}


CK12LocationService.propTypes = {
    country: PropTypes.object,
    locationChangedCallback: PropTypes.func
};