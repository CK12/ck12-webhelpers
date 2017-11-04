define(['profilebuilder/services/ck12.profilebuilder', 'profilebuilder/services/image.upload'], function (profileBuilderService, imageService) {
        'use strict';

        var profileBuilderView;
        var usLocationService;
        var intLocationService;

        function profileBuilderController() {

            function loadProfileBuilder(result, container) {
                profileBuilderView.render(result, container);
            }
            
            function load(container, profileView, locationSer){
                profileBuilderView = profileView;
                usLocationService = locationSer;
                intLocationService = locationSer;
                profileBuilderService.getProfileInformation(loadProfileBuilder, container);
            }

            function saveUserProfile(callback, member) {
                profileBuilderService.saveUserProfile(callback, member);
            }
            
            function initImageUploader(){
                imageService.initImageUploader(profileBuilderView.profileImageUploadCallback);
            }
            
            function loadLocationService(){
                usLocationService.load('usLocation', 'US');
                intLocationService.load('internationalLocation');
            }
            
            function getUserLocation(){
                var loc = {};
                loc.us = usLocationService.getUserLocation();
                loc.international = intLocationService.getUserLocation();
                return loc;
            }

            function setLocationChangedCallback(callback) {
                usLocationService.setLocationChangedCallback(callback);
                intLocationService.setLocationChangedCallback(callback);
            }

            this.load = load;
            this.loadLocationService = loadLocationService;
            this.saveUserProfile = saveUserProfile;
            this.getUserLocation = getUserLocation;
            this.setLocationChangedCallback = setLocationChangedCallback;
            this.initImageUploader = initImageUploader;
        }

        return new profileBuilderController();
    });
