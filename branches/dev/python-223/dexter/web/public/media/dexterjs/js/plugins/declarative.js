define([
    '../utils/extend',
    '../utils/var/xpath',
    '../utils/var/selector'
], function (extend, xpath, selector) {
    'use strict';
    /**
     *A plugin to instrument dexter events declaratively using data attributes.
     *Can be enabled/disabled using the configuration:
     *
     *<b>Default config</b>:
     *  enabled - true
     *  defaultDomEvent - 'click'. see notes.
     *  additionalDomEvents - Empty. Allows capturing other dom events in addition to the defaultDomEvent. See notes.
     *  selector - Looks for 'dxtrack' or 'dxtrack-user-action' class on elements to be tracked
     *  dataPrefix - picks all the data attributes that start with 'data-dx-'
     *
     * Notes:
     * 1. 'defaultDomEvent' limit the defaultDomEvent to events like click.
     * 2. The 'additionalDomEvents' should be a comma separated list of dom events. The dexterjs event will only be fired
     * if the elements 'domEvent' attribute matches one of these events.
     * 3. The 'additionalDomEvents' config should be a superset i.e should include ALL the values you plan to use in the 'domEvent'
     * attribute of the elements.
     * 4. All the events are attached to document object. So only the events that can be attached to document can be used
     * with declarativePlugin.
     *
     *<b>Overide config</b>
     *You can overide the default config when you initialize dexterjs, by passing in the declarativePlugin
     *config with rest of your config
     *
     *      dexterjs.set('config', {
     *          clientID: 'XXXXXX',
     *          trackPageTime: false,
     *          declarativePlugin: {
     *              enabled: true,
     *              defaultDomEvent: 'click',
     *              additionalDomEvents: 'touchend',
     *              selector: '.dxtrack, .dxtrack2',
     *              dataPrefix: 'data-dx'
     *          }
     *      });
     *
     *
     *<b>Examples</b>
     *  You can see some <a href="../../examples/declarative.html">examples</a>
     *
     * @constructor
     * @param {object} dexterjs - dexterjs instance that includes the configuration.
     */
    function Declarative(dexterjs) {
        var config = dexterjs.get('config');
        config = (typeof config !== 'object') ? {} : config;
        var documentElement = document.documentElement;
        var cachedPush = Array.prototype.push;
        var matches = documentElement.matches || documentElement.webkitMatchesSelector || documentElement.mozMatchesSelector || documentElement.oMatchesSelector || documentElement.msMatchesSelector;

        /**
         * @private
         */
        function initialize() {
            initEventListeners();
            //listen for any dexterjs config changes. Normally this will happen
            //when initiliazing dexterjs using dexterjs.set()

            //Remove any previous listener. Less likely for this to happen
            document.removeEventListener('dexterjsConfigChangedEvent', configChangeListener);
            //Listen for dexter config changes
            document.addEventListener('dexterjsConfigChangedEvent', configChangeListener);
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
         */
        function handleDelegate(element, event, dataPrefix) {
            var payload = {};
            //if domEvent attribute is specified on element, it should match the current event
            //if not, the current event should match the defaultDomEvent
            var domEvent = element.getAttribute(dataPrefix + 'domEvent');
            var classes = element.getAttribute('class');
            if ((domEvent && event.type !== domEvent) || (config.declarativePlugin.defaultDomEvent.indexOf(event.type) === -1)) {
                //do not process this event
                return;
            }

            //first get the eventName attribute and bail out if absent
            var eventName = element.getAttribute(dataPrefix + 'eventname');
            //if eventName is absent and if this element does not have dxtrack-user-action class
            if (!eventName || eventName === '') {
                if (classes.indexOf('dxtrack-user-action') !== -1) {
                    //NOTE: dxtrack-user-action is a new generic user action defined.
                    //SEE Pivotal story: https://www.pivotaltracker.com/story/show/127373531
                    eventName = 'FBS_USER_ACTION';
                    //Make sure the data-dx-desc attribute is specified.
                    //This is a required attribute for dxtrack-user-action
                    if (!('data-dx-desc' in element.attributes)) {
                        console.warn('Dexter event not fired. Reason: missing the required "' + dataPrefix + 'desc" attribute on element', element);
                        return;
                    }

                } else {
                    //else we don't have enough details for logging this ads eventName
                    console.warn('Dexter event not fired. Reason: missing the ' + dataPrefix + ' eventname', element);
                    return;
                }
            }

            //can't use element.dataset due to lack of IE support, instead loop attributes
            //and get the needed payload
            var attributes = element.attributes;
            for (var j = 0, attrLen = attributes.length; j < attrLen; j++) {
                var data = attributes[j];
                if (data.name.indexOf(dataPrefix) === 0) {
                    var dataName = data.name.replace(dataPrefix, '');
                    if (dataName === 'eventname') {
                        //skip eventName data attribute, as we already send it
                        //in logEvent
                        continue;
                    }

                    if (dataName === 'payload') {
                        //if the data attribute name is 'payload', parse JSON and use that as payload
                        var jsonPayload = JSON.parse(data.value.replace(/'/g, '\''));
                        payload = extend(true, payload, jsonPayload);
                    } else {
                        payload[dataName] = data.value;
                    }
                } else {
                    //for declarative events, send all attributes
                    payload[data.name] = data.value;
                }
            }
            //we also send following additional information for declarative events:
            //xpath, selector, domContent
            payload['selector'] = selector.select(element, {
                ignore: {
                    attribute: function (name, value, defaultPredicate) {
                        // exclude data-dx-payload data attribute
                        return (/data-dx-payload*/)
                            .test(name) || defaultPredicate(name, value);
                    }
                }
            });
            payload['xpath'] = xpath(element);
            payload['domContent'] = element.innerText;
            dexterjs.logEvent(eventName, payload);
        }

        function delegateListener(event) {
            var elementQuerySelector = config.declarativePlugin.selector;
            var dataPrefix = config.declarativePlugin.dataPrefix;
            var qs = document.querySelector(elementQuerySelector);
            //Make sure there is atleast 1 element on page that has declarative
            //syntax
            if (qs) {
                var el = event.target;
                var matched = false;

                while (el && !(matched = matches.call(el, elementQuerySelector))) {
                    el = el.parentElement;
                }

                if (matched) {
                    try {
                        handleDelegate(el, event, dataPrefix);
                    } catch (err) {
                        console.log(err);
                        //don't raise exception, to prevent problems in
                        //normal execution, while firing dexterjs events.
                    }
                }
            }
        }

        function delegate(eventType) {
            //remove any previous event handler
            document.removeEventListener(eventType, delegateListener, true);
            //Use the event capturing mode
            document.addEventListener(eventType, delegateListener, true);
        }

        /**
         * @private
         * Add event listeners
         */
        function initEventListeners() {
            if (config.declarativePlugin.enabled) {
                var events = ['click']; //default
                var additionalEventStr = null;
                var defaultDomEventStr = config.declarativePlugin.defaultDomEvent;
                if (defaultDomEventStr) {
                    events = []; //overide default
                    cachedPush.apply(events, defaultDomEventStr.split(/[\s,]+/));
                }

                additionalEventStr = config.declarativePlugin.additionalDomEvents;
                if (additionalEventStr) {
                    cachedPush.apply(events, additionalEventStr.split(/[\s,]+/));
                }

                for (var i = 0; i < events.length; i++) {
                    delegate(events[i]);
                }
            }
        }

        initialize.call(this);
    }
    return Declarative;
});
