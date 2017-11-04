define([
    "../utils/extend",
    "../utils/var/deepLookup"
], function(extend, deepLookup) {
    "use strict";
    /**
     *A plugin to push optimizely information to dexter.
     *
     *<b>Default config</b>:
     *  enabled - true
     *
     *
     *<b>Overide config</b>
     *You can overide the default config when you initialize dexterjs, by passing in the optimizelyPlugin
     *config with rest of your config
     *
     *      dexterjs.set("config", {
     *          clientID: "XXXXXX",
     *          optimizelyPlugin: {
     *              enabled: true
     *          }
     *      });
     *
     *
     * @constructor
     * @param {object} dexterjs - dexterjs instance that includes the configuration.
     */
    function Optimizely(dexterjs) {
        var config = dexterjs.get("config");
        config = (typeof config !== "object") ? {} : config;


        /**
         * @private
         */
        function initialize() {
            initEventListeners();
            //listen for any dexterjs config changes. Normally this will happen
            //when initiliazing dexterjs using dexterjs.set()

            //Remove any previous listener. Less likely for this to happen
            document.removeEventListener("dexterjsConfigChangedEvent", configChangeListener);
            //Listen for dexter config changes
            document.addEventListener("dexterjsConfigChangedEvent", configChangeListener);
        }

        /**
         *@private
         */
        function configChangeListener(event) {
            config = extend(true, config, event.data.config);
            initEventListeners();
        }


        /**
         * @private
         * Add event listeners
         */
        function initEventListeners() {
            var allExperiments, variationNamesMap, activeExperiments=[], variations=[];
            if (config.optimizelyPlugin.enabled) {

                allExperiments = deepLookup('optimizely.data.experiments', window);
                variationNamesMap = deepLookup('optimizely.data.state.variationNamesMap', window);
                if (allExperiments && variationNamesMap){
                     Object.keys(variationNamesMap).forEach(function(key){
                        var experiment = allExperiments[key].name,
                            variation = variationNamesMap[key];

                        activeExperiments.push(experiment);
                        variations.push(variation);

                    });
                    dexterjs.set('config', {
                        mixins:{
                            optimizelyState_exp: activeExperiments.join('||'),
                            optimizelyState_var: variations.join('||')
                        }
                    }, true);
                }
            } else {
                dexterjs.set('config', {
                    mixins:{
                        optimizelyState: null
                    }
                }, true);
            }
        }


        initialize.call(this);
    }
    return Optimizely;
});
