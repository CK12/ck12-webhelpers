define(['profilebuilder/services/ck12.locationService'], function ($) {
        'use strict';

    function locationAutoCompleteService(){
        var address = {};
        var locationChangedCallback;

        function init(el, country){
            var input = document.getElementById(el);
            var options = {
                types: ['(regions)'],
                componentRestrictions: {}
            };
            if (country) {
                options.componentRestrictions = {country: country};
            }

            var autocomplete = new google.maps.places.Autocomplete(input, options);

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                address = {};

                var place = autocomplete.getPlace();
                if ('address_components' in place) {
                    var addrc = place.address_components;
                    for (var i = 0; i < addrc.length; i++) {
                        var c = addrc[i];
                        if ((c.types.indexOf('administrative_area_level_2') !== -1) && !address.city) {
                        	address.city = c.long_name;
                        }
                        if ((c.types.indexOf('locality') !== -1 || (c.types.indexOf('locality') === -1 && c.types.indexOf('sublocality') !== -1)) && !address.city ){
                        	address.city = c.long_name;
                        }
                        if (c.types.indexOf('postal_code') !== -1) {
                            address.zip = c.long_name;
                        }
                        if (c.types.indexOf('administrative_area_level_1') !== -1) {
                            address.state = c.short_name;
                            address.province = c.long_name;
                        }
                        if (c.types.indexOf('country') !== -1) {
                            address.country = c.short_name + ': ' + c.long_name;
                        }
                    }
                    if (!jQuery.isEmptyObject(address) && ('city' in address) && ('country' in address)) {
                        if (locationChangedCallback) {
                            locationChangedCallback(address);
                        }
                    }
                    else {
                        var msg = 'Could not determine address';
                        // If possible, customize this msg for actual field name.
                        alert(msg);
                    }
                }
            });
        }
        
        function getUserLocation(){
            return address;
        }

        function setLocationChangedCallback(callback) {
            locationChangedCallback = callback;
        }

        this.load = init;
        this.getUserLocation = getUserLocation;
        this.setLocationChangedCallback = setLocationChangedCallback;
    }
    return new locationAutoCompleteService();
});
