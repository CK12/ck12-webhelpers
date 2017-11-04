/*! LabsJsServer.js - v1.0.1 - 2014-03-19 */
var Labs;
(function (Labs) {
    (function (Core) {
        ;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        /**
        * The current mode of the lab. Whether in edit mode or view mode. Edit is when configuring the lab and view
        * is when taking the lab.
        */
        (function (LabMode) {
            /**
            * The lab is in edit mode. Meaning the user is configuring it
            */
            LabMode[LabMode["Edit"] = 0] = "Edit";

            /**
            * The lab is in view mode. Meaning the user is taking it
            */
            LabMode[LabMode["View"] = 1] = "View";
        })(Core.LabMode || (Core.LabMode = {}));
        var LabMode = Core.LabMode;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        ;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        /**
        * Static class representing the permissions allowed for the given user of the lab
        */
        var Permissions = (function () {
            function Permissions() {
            }
            Permissions.Edit = "Labs.Permissions.Edit";

            Permissions.Take = "Labs.Permissions.Take";
            return Permissions;
        })();
        Core.Permissions = Permissions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsCore.js.map

var Labs;
(function (Labs) {
    (function (Core) {
        (function (Actions) {
            /**
            * Action to create a new attempt
            */
            Actions.CreateAttemptAction = "Labs.Core.Actions.CreateAttemptAction";
        })(Core.Actions || (Core.Actions = {}));
        var Actions = Core.Actions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        (function (Actions) {
            /**
            * Attempt timeout action
            */
            Actions.AttemptTimeoutAction = "Labs.Core.Actions.AttemptTimeoutAction";
        })(Core.Actions || (Core.Actions = {}));
        var Actions = Core.Actions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        (function (Actions) {
            /**
            * Action to retrieve a value associated with an attempt.
            */
            Actions.GetValueAction = "Labs.Core.Actions.GetValueAction";
        })(Core.Actions || (Core.Actions = {}));
        var Actions = Core.Actions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        (function (Actions) {
            /**
            * Resume attempt action. Used to indicate the user is resuming work on a given attempt.
            */
            Actions.ResumeAttemptAction = "Labs.Core.Actions.ResumeAttemptAction";
        })(Core.Actions || (Core.Actions = {}));
        var Actions = Core.Actions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        (function (Actions) {
            /**
            * Action to submit an answer for a given attempt
            */
            Actions.SubmitAnswerAction = "Labs.Core.Actions.SubmitAnswerAction";
        })(Core.Actions || (Core.Actions = {}));
        var Actions = Core.Actions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsActions.js.map

var Labs;
(function (Labs) {
    (function (Core) {
        (function (GetActions) {
            /**
            * Gets actions associated with a given component.
            */
            GetActions.GetComponentActions = "Labs.Core.GetActions.GetComponentActions";
        })(Core.GetActions || (Core.GetActions = {}));
        var GetActions = Core.GetActions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        (function (GetActions) {
            /**
            * Get attempt get action. Retrieves all actions associated with a given attempt.
            */
            GetActions.GetAttempt = "Labs.Core.GetActions.GetAttempt";
        })(Core.GetActions || (Core.GetActions = {}));
        var GetActions = Core.GetActions;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsGetActions.js.map

var Labs;
(function (Labs) {
    /**
    * Base class for components instances
    */
    var ComponentInstanceBase = (function () {
        function ComponentInstanceBase() {
        }
        /**
        * Attaches a LabsInternal to this component instance
        *
        * @param { id } The ID of the component
        * @param { labs } The LabsInternal object for use by the instance
        */
        ComponentInstanceBase.prototype.attach = function (id, labs) {
            this._id = id;
            this._labs = labs;
        };
        return ComponentInstanceBase;
    })();
    Labs.ComponentInstanceBase = ComponentInstanceBase;
})(Labs || (Labs = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Labs;
(function (Labs) {
    /**
    * Class representing a component instance. An instance is an instantiation of a component for a user. It contains
    * a translated view of the component for a particular run of the lab.
    */
    var ComponentInstance = (function (_super) {
        __extends(ComponentInstance, _super);
        /**
        * Constructs a new ComponentInstance.
        *
        * @param { type } The type of component instance being created
        */
        function ComponentInstance() {
            _super.call(this);
        }
        /**
        * Begins a new attempt at the component
        *
        * @param { callback } Callback fired when the attempt has been created
        */
        ComponentInstance.prototype.createAttempt = function (callback) {
            var _this = this;
            // Retrieve the create attempt options
            var createAttemptAction = this.getCreateAttemptOptions();

            // And create the attempt
            this._labs.takeAction(Labs.Core.Actions.CreateAttemptAction, createAttemptAction, function (err, createResult) {
                var attempt = null;
                if (!err) {
                    try  {
                        attempt = _this.buildAttempt(createResult);
                    } catch (exception) {
                        err = exception;
                    }
                }

                setTimeout(function () {
                    return callback(err, attempt);
                }, 0);
            });
        };

        /**
        * Retrieves all attempts associated with the given component
        *
        * @param { callback } Callback fired once the attempts have been retrieved
        */
        ComponentInstance.prototype.getAttempts = function (callback) {
            var _this = this;
            var componentSearch = {
                componentId: this._id,
                action: Labs.Core.Actions.CreateAttemptAction
            };

            this._labs.getActions(Labs.Core.GetActions.GetComponentActions, componentSearch, function (err, actions) {
                // Construct the attempts if there wasn't an error
                var attempts = null;
                if (!err) {
                    attempts = actions.map(function (action) {
                        return _this.buildAttempt(action);
                    });
                }

                // And return them
                setTimeout(function () {
                    return callback(null, attempts);
                }, 0);
            });
        };

        /**
        * Retrieves the default create attempt options. Can be overriden by derived classes.
        */
        ComponentInstance.prototype.getCreateAttemptOptions = function () {
            var createAttemptAction = {
                componentId: this._id
            };

            return createAttemptAction;
        };

        /**
        * method to built an attempt from the given action. Should be implemented by derived classes.
        *
        * @param { createAttemptResult } The create attempt action for the attempt
        */
        ComponentInstance.prototype.buildAttempt = function (createAttemptResult) {
            throw "Not implemented";
        };
        return ComponentInstance;
    })(Labs.ComponentInstanceBase);
    Labs.ComponentInstance = ComponentInstance;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * Enumeration of the connection states
    */
    (function (ConnectionState) {
        /**
        * Disconnected
        */
        ConnectionState[ConnectionState["Disconnected"] = 0] = "Disconnected";

        /**
        * In the process of connecting
        */
        ConnectionState[ConnectionState["Connecting"] = 1] = "Connecting";

        /**
        * Connected
        */
        ConnectionState[ConnectionState["Connected"] = 2] = "Connected";
    })(Labs.ConnectionState || (Labs.ConnectionState = {}));
    var ConnectionState = Labs.ConnectionState;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * Helper class to manage a set of event handlers
    */
    var EventManager = (function () {
        function EventManager() {
            this._handlers = {};
        }
        EventManager.prototype.getHandler = function (event) {
            var handler = this._handlers[event];
            if (handler === undefined) {
                this._handlers[event] = [];
            }

            return this._handlers[event];
        };

        /**
        * Adds a new event handler for the given event
        *
        * @param { event } The event to add a handler for
        * @param { handler } The event handler to add
        */
        EventManager.prototype.add = function (event, handler) {
            var eventHandlers = this.getHandler(event);
            eventHandlers.push(handler);
        };

        /**
        * Removes an event handler for the given event
        *
        * @param { event } The event to remove a handler for
        * @param { handler } The event handler to remove
        */
        EventManager.prototype.remove = function (event, handler) {
            var eventHandlers = this.getHandler(event);
            for (var i = eventHandlers.length - 1; i >= 0; i--) {
                if (eventHandlers[i] === handler) {
                    eventHandlers.splice(i, 1);
                }
            }
        };

        /**
        * Fires the given event
        *
        * @param { event } The event to fire
        * @param { data } Data associated with the event
        */
        EventManager.prototype.fire = function (event, data) {
            var eventHandlers = this.getHandler(event);
            eventHandlers.forEach(function (handler) {
                handler(data);
            });
        };
        return EventManager;
    })();
    Labs.EventManager = EventManager;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * The LabEditor allows for the editing of the given lab. This includes getting and setting
    * the entire configuration associated with the lab.
    */
    var LabEditor = (function () {
        /**
        * Constructs a new LabEditor
        *
        * @param { labsInternal } LabsInternal to use with the editor
        * @param { doneCallback } Callback to invoke when the editor is finished
        */
        function LabEditor(labsInternal, doneCallback) {
            this._labsInternal = labsInternal;
            this._doneCallback = doneCallback;
        }
        LabEditor.Create = /**
        * Creates a new lab. This prepares the lab storage and saves the host version
        *
        * @param { labsInternal } LabsInternal to use with the editor
        * @param { doneCallback } Callback to invoke when the editor is finished
        * @param { callback } Callback fired once the LabEditor has been created
        */
        function (labsInternal, doneCallback, callback) {
            labsInternal.create(function (err, data) {
                if (err) {
                    setTimeout(function () {
                        return callback(err, null);
                    }, 0);
                    return;
                }

                // Instantiate the components and then attach them to the lab
                var labEditor = new LabEditor(labsInternal, doneCallback);
                setTimeout(function () {
                    return callback(null, labEditor);
                }, 0);
            });
        };

        /**
        * Gets the current lab configuration
        *
        * @param { callback } Callback fired once the configuration has been retrieved
        */
        LabEditor.prototype.getConfiguration = function (callback) {
            this._labsInternal.getConfiguration(callback);
        };

        /**
        * Sets a new lab configuration
        *
        * @param { configuration } The configuration to set
        * @param { callback } Callback fired once the configuration has been set
        */
        LabEditor.prototype.setConfiguration = function (configuration, callback) {
            this._labsInternal.setConfiguration(configuration, callback);
        };

        /**
        * Indicates that the user is done editing the lab.
        *
        * @param { callback } Callback fired once the lab editor has finished
        */
        LabEditor.prototype.done = function (callback) {
            this._doneCallback();
            this._doneCallback = null;
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };
        return LabEditor;
    })();
    Labs.LabEditor = LabEditor;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * A LabInstance is an instance of the configured lab for the current user. It is used to
    * record and retrieve per user lab data.
    */
    var LabInstance = (function () {
        /**
        * Constructs a new LabInstance
        *
        * @param { labsInternal } The LabsInternal to use with the instance
        * @param { components } The components of the lab instance
        * @param { doneCallback } Callback to invoke once the user is done taking the instance
        */
        function LabInstance(labsInternal, components, doneCallback) {
            this._labsInternal = labsInternal;
            this.components = components;
            this._doneCallback = doneCallback;
        }
        LabInstance.Create = /**
        * Creates a new LabInstance
        *
        * @param { labsInternal } The LabsInternal to use with the instance
        * @param { doneCallback } Callback to invoke once the user is done taking the instance
        * @param { callback } Callback that fires once the LabInstance has been created
        */
        function (labsInternal, doneCallback, callback) {
            labsInternal.getConfigurationInstance(function (err, configuration) {
                if (err) {
                    setTimeout(function () {
                        return callback(err, null);
                    }, 0);
                    return;
                }

                // Instantiate the components and then attach them to the lab
                var components = configuration.components.map(function (component) {
                    var componentInstance = Labs.deserialize(component);
                    componentInstance.attach(component.componentId, labsInternal);
                    return componentInstance;
                });
                var labInstance = new LabInstance(labsInternal, components, doneCallback);

                // And return it to the user
                setTimeout(function () {
                    return callback(null, labInstance);
                }, 0);
            });
        };

        /**
        * Gets the current state of the lab for the user
        *
        * @param { callback } Callback that fires with the lab state
        */
        LabInstance.prototype.getState = function (callback) {
            this._labsInternal.getState(callback);
        };

        /**
        * Sets the state of the lab for the user
        *
        * @param { state } The state to set
        * @param { callback } Callback that fires once the state is set
        */
        LabInstance.prototype.setState = function (state, callback) {
            this._labsInternal.setState(state, callback);
        };

        /**
        * Indicates that the user is done taking the lab.
        *
        * @param { callback } Callback fired once the lab instance has finished
        */
        LabInstance.prototype.done = function (callback) {
            this._doneCallback();
            this._doneCallback = null;
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };
        return LabInstance;
    })();
    Labs.LabInstance = LabInstance;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    // Current initialization state
    var _connectionState = Labs.ConnectionState.Disconnected;

    // Internal device we use to communicate with the host
    var _labsInternal;

    // Cached information received during a connection
    var _connectionResponse;

    // Timeline control class
    var _timeline;

    // Map of deserialization functions
    var _labDeserializers = {};

    // Instance of lab being taken
    var _labInstance = null;

    // Instance of lab being edited
    var _labEditor = null;

    /**
    * Method to use to construct a default ILabHost
    */
    Labs.DefaultHostBuilder;

    function connect(labHost, callback) {
        if (_connectionState !== Labs.ConnectionState.Disconnected) {
            throw "connect has previously been called";
        }

        // Set the correct parameters after the method overloading
        var translatedCallback = callback === undefined ? labHost : callback;
        var translatedLabHost = callback === undefined ? Labs.DefaultHostBuilder() : labHost;

        // Instantiate the internal labs class
        var labsInternal;
        try  {
            labsInternal = new Labs.LabsInternal(translatedLabHost);
        } catch (exception) {
            setTimeout(function () {
                return translatedCallback(exception, null);
            }, 0);
            return;
        }

        // Now that we've been able to create the objects, set the state to connecting
        _connectionState = Labs.ConnectionState.Connecting;

        // And go and initialize communication with the host
        labsInternal.connect(function (err, connectionResponse) {
            if (err) {
                _connectionState = Labs.ConnectionState.Disconnected;
                _labsInternal = null;
                _connectionResponse = null;
            } else {
                _connectionState = Labs.ConnectionState.Connected;
                _labsInternal = labsInternal;
                _connectionResponse = connectionResponse;
            }

            setTimeout(function () {
                return translatedCallback(err, connectionResponse);
            });
        });
    }
    Labs.connect = connect;

    /**
    * Returns whether or not the labs are connected to the host.
    */
    function isConnected() {
        return _connectionState === Labs.ConnectionState.Connected;
    }
    Labs.isConnected = isConnected;

    /**
    * Retrieves the information associated with a connection
    */
    function getConnectionInfo() {
        checkIsConnected();

        return _connectionResponse;
    }
    Labs.getConnectionInfo = getConnectionInfo;

    /**
    * Disconnects from the host.
    *
    * @param { completionStatus } The final result of the lab interaction
    */
    function disconnect(completionStatus) {
        checkIsConnected();

        // Update our state to be disconnected
        _labsInternal.dispose(completionStatus);
        _labsInternal = null;
        _connectionState = Labs.ConnectionState.Disconnected;
    }
    Labs.disconnect = disconnect;

    /**
    * Opens the lab for editing. When in edit mode the configuration can be specified. A lab cannot be edited while it
    * is being taken.
    *
    * @param { callback } Callback fired once the LabEditor is created
    */
    function editLab(callback) {
        checkIsConnected();

        if (_labInstance !== null) {
            throw "Lab is being taken";
        }
        if (_labEditor !== null) {
            throw "Lab edit already in progress";
        }

        Labs.LabEditor.Create(_labsInternal, function () {
            _labEditor = null;
        }, function (err, labEditor) {
            _labEditor = !err ? labEditor : null;
            setTimeout(function () {
                return callback(err, labEditor);
            }, 0);
        });
    }
    Labs.editLab = editLab;

    /**
    * Takes the given lab. This allows results to be sent for the lab. A lab cannot be taken while it is being edited.
    *
    * @param { callback } Callback fired once the LabInstance is created
    */
    function takeLab(callback) {
        checkIsConnected();

        if (_labEditor !== null) {
            throw "Lab is being edited";
        }
        if (_labInstance !== null) {
            throw "Lab already in progress";
        }

        Labs.LabInstance.Create(_labsInternal, function () {
            _labInstance = null;
        }, function (err, labInstance) {
            _labInstance = !err ? labInstance : null;
            setTimeout(function () {
                return callback(err, labInstance);
            }, 0);
        });
    }
    Labs.takeLab = takeLab;

    /**
    * Adds a new event handler for the given event
    *
    * @param { event } The event to add a handler for
    * @param { handler } The event handler to add
    */
    function on(event, handler) {
        checkIsConnected();

        _labsInternal.on(event, handler);
    }
    Labs.on = on;

    /**
    * Removes an event handler for the given event
    *
    * @param { event } The event to remove a handler for
    * @param { handler } The event handler to remove
    */
    function off(event, handler) {
        checkIsConnected();

        _labsInternal.off(event, handler);
    }
    Labs.off = off;

    /**
    * Retrieves the Timeline object that can be used to control the host's player control.
    */
    function getTimeline() {
        checkIsConnected();

        return _timeline;
    }
    Labs.getTimeline = getTimeline;

    /**
    * Registers a function to deserialize the given type. Should be used by component authors only.
    *
    * @param { type } The type to deserialize
    * @param { deserialize } The deserialization function
    */
    function registerDeserializer(type, deserialize) {
        if (type in _labDeserializers) {
            throw "Type already has a create function registered";
        }

        // Save the serialization functions
        _labDeserializers[type] = deserialize;
    }
    Labs.registerDeserializer = registerDeserializer;

    /**
    * Deserializes the given json object into an object. Should be used by component authors only.
    *
    * @param { json } The ILabObject to deserialize
    */
    function deserialize(json) {
        if (!(json.type in _labDeserializers)) {
            throw "Unknown type";
        }

        return _labDeserializers[json.type](json);
    }
    Labs.deserialize = deserialize;

    /**
    * Helper method to catch and throw if not connected
    */
    function checkIsConnected() {
        if (_connectionState != Labs.ConnectionState.Connected) {
            throw "API not initialized";
        }
    }
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * Enum representing the internal state of the lab
    */
    var LabsInternalState;
    (function (LabsInternalState) {
        /**
        * Initial state
        */
        LabsInternalState[LabsInternalState["None"] = 0] = "None";

        /**
        * Initialized state
        */
        LabsInternalState[LabsInternalState["Initialized"] = 1] = "Initialized";

        /**
        * LabsInternal has been disposed
        */
        LabsInternalState[LabsInternalState["Disposed"] = 2] = "Disposed";
    })(LabsInternalState || (LabsInternalState = {}));

    /**
    * Class used to interface with the underlying ILabsHost interface.
    */
    var LabsInternal = (function () {
        /**
        * Constructs a new LabsInternal
        *
        * @param { labHost } The ILabHost to make use of
        */
        function LabsInternal(labHost) {
            /**
            * Current state of the LabsInternal
            */
            this._state = LabsInternalState.None;
            /**
            * Helper class to manage events in the system
            */
            this._eventManager = new Labs.EventManager();
            /**
            * The version of the host this LabsInternal is making use of
            */
            this._hostVersion = null;
            // Get the version info from the lab host - only support 0.1 hosts for now
            var versions = labHost.getSupportedVersions();

            var hasSupportedVersion = false;
            for (var i = 0; i < versions.length; i++) {
                if (versions[i].version.major === 0 && versions[i].version.minor <= 1) {
                    hasSupportedVersion = true;
                }
            }

            if (!hasSupportedVersion) {
                throw "Unsupported host version";
            }

            this._labHost = labHost;
        }
        /**
        * Connect to the host
        *
        * @param { callback } Callback that will return the IConnectionResponse when connected
        */
        LabsInternal.prototype.connect = function (callback) {
            var _this = this;
            if (this._state !== LabsInternalState.None) {
                throw "Already initialized";
            }

            // initialize the host
            this._labHost.connect(this._labHost.getSupportedVersions().splice(0), function (err, initialState) {
                if (!err) {
                    // Set the initialization state
                    _this._state = LabsInternalState.Initialized;

                    // Save the host version used
                    _this._hostVersion = initialState.hostVersion;

                    // Register for messages coming from the host
                    _this._labHost.on(function (message, messageData) {
                        return _this._eventManager.fire(message, messageData);
                    });
                }

                setTimeout(function () {
                    return callback(err, initialState);
                }, 0);
            });
        };

        /**
        * Creates a new lab
        *
        * @param { callback } Callback fired once the create operation completes
        */
        LabsInternal.prototype.create = function (callback) {
            this.checkIsInitialized();

            this._labHost.create({}, function (err, editData) {
                setTimeout(function () {
                    return callback(err, editData);
                });
            });
        };

        /**
        * Terminates the LabsInternal class and halts the connection.
        *
        * @param { completionStatus } Completion status of the connection
        */
        LabsInternal.prototype.dispose = function (completionStatus) {
            this.checkIsInitialized();

            this._state = LabsInternalState.Disposed;
            this._labHost.disconnect(completionStatus, function (err, data) {
                if (err) {
                    console.error("Labs.js: Error disconnecting from host.");
                }
            });
        };

        /**
        * Adds an event handler for the given event
        *
        * @param { event } The event to listen for
        * @param { handler } Handler fired for the given event
        */
        LabsInternal.prototype.on = function (event, handler) {
            this.checkIsInitialized();

            this._eventManager.add(event, handler);
        };

        /**
        * Removes an event handler for the given event
        *
        * @param { event } The event whose handler should be removed
        * @param { handler } Handler to remove
        */
        LabsInternal.prototype.off = function (event, handler) {
            this.checkIsInitialized();

            this._eventManager.remove(event, handler);
        };

        /**
        * Gets the current state of the lab for the user
        *
        * @param { callback } Callback that fires when the state is retrieved
        */
        LabsInternal.prototype.getState = function (callback) {
            this.checkIsInitialized();

            this._labHost.getState(callback);
        };

        /**
        * Sets the state of the lab for the user
        *
        * @param { state } The state to set
        * @param { callback } Callback fired once the state has been set
        */
        LabsInternal.prototype.setState = function (state, callback) {
            this.checkIsInitialized();

            this._labHost.setState(state, callback);
        };

        /**
        * Gets the current lab configuration
        *
        * @param { callback } Callback that fires when the configuration is retrieved
        */
        LabsInternal.prototype.getConfiguration = function (callback) {
            this.checkIsInitialized();

            this._labHost.getConfiguration(callback);
        };

        /**
        * Sets a new lab configuration
        *
        * @param { configuration } The lab configuration to set
        * @param { callback } Callback that fires once the configuration has been set
        */
        LabsInternal.prototype.setConfiguration = function (configuration, callback) {
            this.checkIsInitialized();

            this._labHost.setConfiguration(configuration, callback);
        };

        /**
        * Retrieves the configuration instance for the lab.
        *
        * @param { callback } Callback that fires when the configuration instance has been retrieved
        */
        LabsInternal.prototype.getConfigurationInstance = function (callback) {
            this.checkIsInitialized();
            this._labHost.getConfigurationInstance(callback);
        };

        LabsInternal.prototype.takeAction = function (type, options, result, callback) {
            this.checkIsInitialized();

            if (callback !== undefined) {
                this._labHost.takeAction(type, options, result, callback);
            } else {
                this._labHost.takeAction(type, options, result);
            }
        };

        /**
        * Retrieves actions
        *
        * @param { type } The type of get to perform
        * @param { options } The options associated with the get
        * @param { callback } Callback that fires with the completed actions
        */
        LabsInternal.prototype.getActions = function (type, options, callback) {
            this.checkIsInitialized();
            this._labHost.getActions(type, options, callback);
        };

        /**
        * Checks whether or not the LabsInternal is initialized
        */
        LabsInternal.prototype.checkIsInitialized = function () {
            if (this._state !== LabsInternalState.Initialized) {
                throw "Not initialized";
            }
        };
        return LabsInternal;
    })();
    Labs.LabsInternal = LabsInternal;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * Provides access to the labs.js timeline
    */
    var Timeline = (function () {
        function Timeline() {
        }
        return Timeline;
    })();
    Labs.Timeline = Timeline;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * A ValueHolder is responsible for holding a value that when requested is tracked by labs.js.
    * This value may be stored locally or stored on the server.
    */
    var ValueHolder = (function () {
        /**
        * Constructs a new ValueHolder
        *
        * @param { attemptId } The attempt the value is associated with
        * @param { id } The id of the value
        * @param { labs } The labs device that can be used to request the value
        * @param { isHint } Whether or not the value is a hint
        * @param { hasBeenRequested } Whether or not the value has already been requested
        * @param { hasValue } Whether or not the value is available
        * @param { value } If hasValue is true this is the value, otherwise is optional
        */
        function ValueHolder(attemptId, id, labs, isHint, hasBeenRequested, hasValue, value) {
            this._attemptId = attemptId;
            this.id = id;
            this._labs = labs;
            this.isHint = isHint;
            this.hasBeenRequested = hasBeenRequested;
            this.hasValue = hasValue;
            this.value = value;
        }
        /**
        * Retrieves the given value
        *
        * @param { callback } Callback that returns the given value
        */
        ValueHolder.prototype.getValue = function (callback) {
            var _this = this;
            if (this.hasValue && this.hasBeenRequested) {
                setTimeout(function () {
                    return callback(null, _this.value);
                }, 0);
                return;
            }

            // Otherwise construct the message to retrieve it and send it back
            var options = {
                attemptId: this._attemptId,
                valueId: this.id,
                isHint: this.isHint
            };
            this._labs.takeAction(Labs.Core.Actions.GetValueAction, options, function (err, completedAction) {
                if (!err) {
                    var result = completedAction.result;
                    _this.value = result.value;
                    _this.hasValue = true;
                    _this.hasBeenRequested = true;
                }

                setTimeout(function () {
                    return callback(err, _this.value);
                }, 0);
            });
        };

        /**
        * Internal method used to actually provide a value to the value holder
        *
        * @param { value } The value to set for the holder
        */
        ValueHolder.prototype.provideValue = function (value) {
            this.value = value;
            this.hasValue = true;
            this.hasBeenRequested = true;
        };
        return ValueHolder;
    })();
    Labs.ValueHolder = ValueHolder;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsApi.js.map

var Labs;
(function (Labs) {
    (function (Components) {
        var ActivityComponentAttempt = (function () {
            /**
            * Constructs a new ChoiceComponentAttempt.
            *
            * @param { labs } The LabsInternal to use with the attempt
            * @param { attemptId } The ID associated with the attempt
            * @param { values } The values associated with the attempt
            */
            function ActivityComponentAttempt(labs, attemptId, values) {
                // Whether or not the component has been resumed
                this._resumed = false;
                // Current state of the attempt
                this._state = Labs.ProblemState.InProgress;
                // Values associated with the attempt
                this._values = {};
                this._labs = labs;
                this._id = attemptId;

                for (var key in values) {
                    var valueHolderValues = [];
                    var valueArray = values[key];
                    for (var i = 0; i < valueArray.length; i++) {
                        var value = valueArray[i];
                        valueHolderValues.push(new Labs.ValueHolder(this._id, value.valueId, this._labs, value.isHint, false, value.hasValue, value.value));
                    }

                    this._values[key] = valueHolderValues;
                }
            }
            /**
            * Used to indicate that the lab has resumed progress on the given attempt. Loads in existing data as part of this process. An attempt
            * must be resumed before it can be used.
            *
            * @param { callback } Callback fired once the attempt is resumed
            */
            ActivityComponentAttempt.prototype.resume = function (callback) {
                var _this = this;
                if (this._resumed) {
                    throw "Already resumed";
                }

                var attemptSearch = {
                    attemptId: this._id
                };
                this._labs.getActions(Labs.Core.GetActions.GetAttempt, attemptSearch, function (err, actions) {
                    if (err) {
                        setTimeout(function () {
                            return callback(err, null);
                        }, 0);
                        return;
                    }

                    _this.resumeCore(actions);
                    _this.sendResumeAction(function (resumeErr, data) {
                        if (!resumeErr) {
                            _this._resumed = true;
                        }

                        setTimeout(function () {
                            return callback(err, data);
                        });
                    });
                });
            };

            ActivityComponentAttempt.prototype.complete = function (callback) {
                var _this = this;
                var submitAnswer = {
                    attemptId: this._id,
                    answer: null
                };

                this._labs.takeAction(Labs.Core.Actions.SubmitAnswerAction, submitAnswer, null, function (err, completedAction) {
                    if (err) {
                        setTimeout(function () {
                            return callback(err, null);
                        }, 0);
                        return;
                    }

                    _this._state = Labs.ProblemState.Completed;

                    setTimeout(function () {
                        return callback(null, null);
                    }, 0);
                });
            };

            /**
            * Retrieves the state of the lab
            */
            ActivityComponentAttempt.prototype.getState = function () {
                return this._state;
            };

            /**
            * Verifies that the attempt has been resumed
            */
            ActivityComponentAttempt.prototype.verifyResumed = function () {
                if (!this._resumed) {
                    throw "Attempt has not yet been resumed";
                }
            };

            /**
            * Helper method to send the resume action to the host
            */
            ActivityComponentAttempt.prototype.sendResumeAction = function (callback) {
                var resumeAttemptActon = {
                    attemptId: this._id
                };

                this._labs.takeAction(Labs.Core.Actions.ResumeAttemptAction, resumeAttemptActon, function (err, data) {
                    if (!err) {
                    }

                    setTimeout(function () {
                        return callback(err, null);
                    }, 0);
                });
            };

            /**
            * Runs over the retrieved actions for the attempt and populates the state of the lab
            */
            ActivityComponentAttempt.prototype.resumeCore = function (actions) {
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];

                    if (action.type === Labs.Core.Actions.SubmitAnswerAction) {
                        this._state = Labs.ProblemState.Completed;
                    } else if (action.type === Labs.Core.Actions.GetValueAction) {
                        this.useValue(action);
                    }
                }
            };

            /**
            * Makes use of a value in the value array
            */
            ActivityComponentAttempt.prototype.useValue = function (completedSubmission) {
                var useValueAction = completedSubmission.options;
                var useValueResult = completedSubmission.result;

                var valueId = useValueAction.valueId;

                for (var key in this._values) {
                    var valueArray = this._values[key];
                    for (var i = 0; i < valueArray.length; i++) {
                        if (valueArray[i].id === valueId) {
                            valueArray[i].provideValue(useValueResult.value);
                        }
                    }
                }
            };
            return ActivityComponentAttempt;
        })();
        Components.ActivityComponentAttempt = ActivityComponentAttempt;
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Labs;
(function (Labs) {
    (function (Components) {
        Components.ActivityComponentInstanceType = "Labs.Components.ActivityComponentInstance";

        var ActivityComponentInstance = (function (_super) {
            __extends(ActivityComponentInstance, _super);
            /**
            * Constructs a new ActivityComponentInstnace
            *
            * @param { component } The IActivityComponentInstance to create this class from
            */
            function ActivityComponentInstance(component) {
                _super.call(this);
                this.component = component;
            }
            /**
            * Builds a new ChoiceComponentAttempt. Implements abstract method defined on the base class.
            *
            * @param { createAttemptResult } The result from a create attempt action
            */
            ActivityComponentInstance.prototype.buildAttempt = function (createAttemptAction) {
                var id = (createAttemptAction.result).attemptId;
                return new Components.ActivityComponentAttempt(this._labs, id, this.component.values);
            };
            return ActivityComponentInstance;
        })(Labs.ComponentInstance);
        Components.ActivityComponentInstance = ActivityComponentInstance;

        // Register the deserializer for this type. This will cause all components to make use of this class.
        Labs.registerDeserializer(Components.ActivityComponentInstanceType, function (json) {
            return new ActivityComponentInstance(json);
        });
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * Answer to a choice component problem
        */
        var ChoiceComponentAnswer = (function () {
            /**
            * Constructs a new ChoiceComponentAnswer
            */
            function ChoiceComponentAnswer(answer) {
                this.answer = answer;
            }
            return ChoiceComponentAnswer;
        })();
        Components.ChoiceComponentAnswer = ChoiceComponentAnswer;
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * A class representing an attempt at a choice component
        */
        var ChoiceComponentAttempt = (function () {
            /**
            * Constructs a new ChoiceComponentAttempt.
            *
            * @param { labs } The LabsInternal to use with the attempt
            * @param { attemptId } The ID associated with the attempt
            * @param { values } The values associated with the attempt
            */
            function ChoiceComponentAttempt(labs, attemptId, values) {
                // Whether or not the component has been resumed
                this._resumed = false;
                // Current state of the attempt
                this._state = Labs.ProblemState.InProgress;
                // Submissions associated with the attempt
                this._submissions = [];
                // Values associated with the attempt
                this._values = {};
                this._labs = labs;
                this._id = attemptId;

                for (var key in values) {
                    var valueHolderValues = [];
                    var valueArray = values[key];
                    for (var i = 0; i < valueArray.length; i++) {
                        var value = valueArray[i];
                        valueHolderValues.push(new Labs.ValueHolder(this._id, value.valueId, this._labs, value.isHint, false, value.hasValue, value.value));
                    }

                    this._values[key] = valueHolderValues;
                }
            }
            /**
            * Verifies that the attempt has been resumed
            */
            ChoiceComponentAttempt.prototype.verifyResumed = function () {
                if (!this._resumed) {
                    throw "Attempt has not yet been resumed";
                }
            };

            /**
            * Returns whether or not the app has been resumed
            */
            ChoiceComponentAttempt.prototype.isResumed = function () {
                return this._resumed;
            };

            /**
            * Used to indicate that the lab has resumed progress on the given attempt. Loads in existing data as part of this process. An attempt
            * must be resumed before it can be used.
            *
            * @param { callback } Callback fired once the attempt is resumed
            */
            ChoiceComponentAttempt.prototype.resume = function (callback) {
                var _this = this;
                if (this._resumed) {
                    throw "Already resumed";
                }

                var attemptSearch = {
                    attemptId: this._id
                };
                this._labs.getActions(Labs.Core.GetActions.GetAttempt, attemptSearch, function (err, actions) {
                    if (err) {
                        setTimeout(function () {
                            return callback(err, null);
                        }, 0);
                        return;
                    }

                    _this.resumeCore(actions);
                    _this.sendResumeAction(function (resumeErr, data) {
                        if (!resumeErr) {
                            _this._resumed = true;
                        }

                        setTimeout(function () {
                            return callback(err, data);
                        });
                    });
                });
            };

            /**
            * Helper method to send the resume action to the host
            */
            ChoiceComponentAttempt.prototype.sendResumeAction = function (callback) {
                var resumeAttemptActon = {
                    attemptId: this._id
                };

                this._labs.takeAction(Labs.Core.Actions.ResumeAttemptAction, resumeAttemptActon, function (err, data) {
                    if (!err) {
                    }

                    setTimeout(function () {
                        return callback(err, null);
                    }, 0);
                });
            };

            /**
            * Runs over the retrieved actions for the attempt and populates the state of the lab
            */
            ChoiceComponentAttempt.prototype.resumeCore = function (actions) {
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];

                    if (action.type === Labs.Core.Actions.SubmitAnswerAction) {
                        this.storeSubmission(action);
                    } else if (action.type === Labs.Core.Actions.GetValueAction) {
                        this.useValue(action);
                    } else if (action.type == Labs.Core.Actions.AttemptTimeoutAction) {
                        this._state = Labs.ProblemState.Timeout;
                    }
                }
            };

            /**
            * Used to mark that the lab has timed out
            *
            * @param { callback } Callback fired once the server has received the timeout message
            */
            ChoiceComponentAttempt.prototype.timeout = function (callback) {
                var _this = this;
                this._labs.takeAction(Labs.Core.Actions.AttemptTimeoutAction, { attemptId: this._id }, function (err, result) {
                    if (!err) {
                        _this._state = Labs.ProblemState.Timeout;
                    }

                    setTimeout(function () {
                        return callback(err, null);
                    }, 0);
                });
            };

            /**
            * Retrieves the cached values associated with the attempt
            *
            * @param { key } The key to lookup in the value map
            */
            ChoiceComponentAttempt.prototype.getValues = function (key) {
                this.verifyResumed();

                return this._values[key];
            };

            /**
            * Retrieves all of the submissions that have previously been submitted for the given attempt
            */
            ChoiceComponentAttempt.prototype.getSubmissions = function () {
                this.verifyResumed();

                return this._submissions;
            };

            /**
            * Submits a new answer that was graded by the lab and will not use the host to compute a grade.
            *
            * @param { answer } The answer for the attempt
            * @param { result } The result of the submission
            * @param { callback } Callback fired once the submission has been received
            */
            ChoiceComponentAttempt.prototype.submit = function (answer, result, callback) {
                var _this = this;
                this.verifyResumed();

                var submitAnswer = {
                    attemptId: this._id,
                    answer: answer.answer
                };

                var submitResult = {
                    submissionId: null,
                    complete: result.complete,
                    score: result.score
                };

                this._labs.takeAction(Labs.Core.Actions.SubmitAnswerAction, submitAnswer, submitResult, function (err, completedAction) {
                    if (err) {
                        setTimeout(function () {
                            return callback(err, null);
                        }, 0);
                        return;
                    }

                    var submission = _this.storeSubmission(completedAction);

                    setTimeout(function () {
                        return callback(null, submission);
                    }, 0);
                });
            };

            /**
            * Retrieves the state of the lab
            */
            ChoiceComponentAttempt.prototype.getState = function () {
                return this._state;
            };

            /**
            * Helper method used to handle a returned submission from labs core
            */
            ChoiceComponentAttempt.prototype.storeSubmission = function (completedSubmission) {
                var options = completedSubmission.options;
                var result = completedSubmission.result;

                if (result.complete) {
                    this._state = Labs.ProblemState.Completed;
                }

                var submission = new Components.ChoiceComponentSubmission(new Components.ChoiceComponentAnswer(options.answer), new Components.ChoiceComponentResult(result.score, result.complete), completedSubmission.time);

                this._submissions.push(submission);

                return submission;
            };

            /**
            * Makes use of a value in the value array
            */
            ChoiceComponentAttempt.prototype.useValue = function (completedSubmission) {
                var useValueAction = completedSubmission.options;
                var useValueResult = completedSubmission.result;

                var valueId = useValueAction.valueId;

                for (var key in this._values) {
                    var valueArray = this._values[key];
                    for (var i = 0; i < valueArray.length; i++) {
                        if (valueArray[i].id === valueId) {
                            valueArray[i].provideValue(useValueResult.value);
                        }
                    }
                }
            };
            return ChoiceComponentAttempt;
        })();
        Components.ChoiceComponentAttempt = ChoiceComponentAttempt;
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * The name of the component instance. A choice component is a component that has multiple choice options and supports zero
        * or more responses. Optionally there is a correct list of choices.
        */
        Components.ChoiceComponentInstanceType = "Labs.Components.ChoiceComponentInstance";

        /**
        * Class representing a choice component instance
        */
        var ChoiceComponentInstance = (function (_super) {
            __extends(ChoiceComponentInstance, _super);
            /**
            * Constructs a new ChoiceComponentInstance
            *
            * @param { component } The IChoiceComponentInstance to create this class from
            */
            function ChoiceComponentInstance(component) {
                _super.call(this);
                this.component = component;
            }
            /**
            * Builds a new ChoiceComponentAttempt. Implements abstract method defined on the base class.
            *
            * @param { createAttemptResult } The result from a create attempt action
            */
            ChoiceComponentInstance.prototype.buildAttempt = function (createAttemptAction) {
                var id = (createAttemptAction.result).attemptId;
                return new Components.ChoiceComponentAttempt(this._labs, id, this.component.values);
            };
            return ChoiceComponentInstance;
        })(Labs.ComponentInstance);
        Components.ChoiceComponentInstance = ChoiceComponentInstance;

        // Register the deserializer for this type. This will cause all components to make use of this class.
        Labs.registerDeserializer(Components.ChoiceComponentInstanceType, function (json) {
            return new ChoiceComponentInstance(json);
        });
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * Type string for an ActivityComponent
        */
        Components.ActivityComponentType = "Labs.Components.ActivityComponent";
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * Type string to use with this type of component
        */
        Components.ChoiceComponentType = "Labs.Components.ChoiceComponent";
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * Type string to use with this type of component
        */
        Components.InputComponentType = "Labs.Components.InputComponent";
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * State values for a lab
    */
    (function (ProblemState) {
        /**
        * The problem is in progress
        */
        ProblemState[ProblemState["InProgress"] = 0] = "InProgress";

        /**
        * The problem has timed out
        */
        ProblemState[ProblemState["Timeout"] = 1] = "Timeout";

        /**
        * The problem has completed
        */
        ProblemState[ProblemState["Completed"] = 2] = "Completed";
    })(Labs.ProblemState || (Labs.ProblemState = {}));
    var ProblemState = Labs.ProblemState;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * The result of a choice component submission
        */
        var ChoiceComponentResult = (function () {
            /**
            * Constructs a new ChoiceComponentResult
            *
            * @param { score } The score of the result
            * @param { complete } Whether or not the result completed the attempt
            */
            function ChoiceComponentResult(score, complete) {
                this.score = score;
                this.complete = complete;
            }
            return ChoiceComponentResult;
        })();
        Components.ChoiceComponentResult = ChoiceComponentResult;
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Components) {
        /**
        * Class that represents a choice component submission
        */
        var ChoiceComponentSubmission = (function () {
            /**
            * Constructs a new ChoiceComponentSubmission
            *
            * @param { answer } The answer associated with the submission
            * @param { result } The result of the submission
            * @param { time } The time at which the submission was received
            */
            function ChoiceComponentSubmission(answer, result, time) {
                this.answer = answer;
                this.result = result;
                this.time = time;
            }
            return ChoiceComponentSubmission;
        })();
        Components.ChoiceComponentSubmission = ChoiceComponentSubmission;
    })(Labs.Components || (Labs.Components = {}));
    var Components = Labs.Components;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsComponents.js.map

var Labs;
(function (Labs) {
    /**
    * General command used to pass messages between the client and host
    */
    var Command = (function () {
        /**
        * Constructs a new command
        *
        * @param { type } The type of command
        * @param { commandData } Optional data associated with the command
        */
        function Command(type, commandData) {
            this.type = type;
            this.commandData = commandData;
        }
        return Command;
    })();
    Labs.Command = Command;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * Strings representing supported command types
    */
    (function (CommandType) {
        CommandType.Connect = "connect";

        CommandType.Disconnect = "disconnect";

        CommandType.Create = "create";

        CommandType.GetConfigurationInstance = "getConfigurationInstance";

        CommandType.TakeAction = "takeAction";

        CommandType.GetCompletedActions = "getCompletedActions";

        CommandType.ModeChanged = "modeChanged";

        CommandType.GetConfiguration = "getConfiguration";

        CommandType.SetConfiguration = "setConfiguratoin";

        CommandType.GetState = "getState";

        CommandType.SetState = "setState";
    })(Labs.CommandType || (Labs.CommandType = {}));
    var CommandType = Labs.CommandType;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    (function (Core) {
        /**
        * Static class containing the different event types.
        */
        var EventTypes = (function () {
            function EventTypes() {
            }
            EventTypes.ModeChanged = "modeChanged";
            return EventTypes;
        })();
        Core.EventTypes = EventTypes;
    })(Labs.Core || (Labs.Core = {}));
    var Core = Labs.Core;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * Type of message being sent over the wire
    */
    (function (MessageType) {
        MessageType[MessageType["Message"] = 0] = "Message";
        MessageType[MessageType["Completion"] = 1] = "Completion";
        MessageType[MessageType["Failure"] = 2] = "Failure";
    })(Labs.MessageType || (Labs.MessageType = {}));
    var MessageType = Labs.MessageType;

    /**
    * The message being sent
    */
    var Message = (function () {
        function Message(id, labId, type, payload) {
            this.id = id;
            this.labId = labId;
            this.type = type;
            this.payload = payload;
        }
        return Message;
    })();
    Labs.Message = Message;

    var MessageProcessor = (function () {
        function MessageProcessor(labId, targetWindow, targetOrigin, messageHandler) {
            this._labId = labId;
            this.isStarted = false;
            this.targetWindow = targetWindow;
            this.nextMessageId = 0;
            this.targetOrigin = targetOrigin;
            this.messageHandler = messageHandler;
            this.messageMap = {};
        }
        MessageProcessor.prototype.throwIfNotStarted = function () {
            if (!this.isStarted) {
                throw "Processor has not been started";
            }
        };

        MessageProcessor.prototype.getNextMessageId = function () {
            return this.nextMessageId++;
        };

        ///
        /// Given a URI parses it and returns the origin to use in postMessage security checks
        ///
        MessageProcessor.prototype.parseOrigin = function (href) {
            var parser = document.createElement('a');
            parser.href = href;
            return parser.protocol + "//" + parser.host;
        };

        MessageProcessor.prototype.listener = function (event) {
            var _this = this;
            var callback;

            // Get the message - we only listen to events going to our lab ID
            var messageEvent = event;
            var message = JSON.parse(messageEvent.data);
            if (message.labId !== this._labId) {
                return;
            }

            if (!this.targetWindow) {
                this.targetWindow = messageEvent.source;
            }

            if (messageEvent.source !== this.targetWindow) {
                return;
            }

            if (message.type === MessageType.Completion) {
                callback = this.messageMap[message.id];
                delete this.messageMap[message.id];
                callback(null, message.payload);
            } else if (message.type === MessageType.Failure) {
                callback = this.messageMap[message.id];
                delete this.messageMap[message.id];
                callback({ error: message.payload }, null);
            } else if (message.type == MessageType.Message) {
                this.messageHandler(message.payload, function (err, data) {
                    if (err) {
                        var failureMessage = new Message(message.id, _this._labId, MessageType.Failure, data);
                        _this.postMessage(failureMessage);
                    } else {
                        var acknowledgementMessage = new Message(message.id, _this._labId, MessageType.Completion, data);
                        _this.postMessage(acknowledgementMessage);
                    }
                });
            } else {
                throw "Unknown message type";
            }
        };

        MessageProcessor.prototype.postMessage = function (message) {
            if (!this.targetWindow) {
                throw "Unknown target window";
            }

            this.targetWindow.postMessage(JSON.stringify(message), this.targetOrigin);
        };

        MessageProcessor.prototype.start = function () {
            var _this = this;
            if (this.isStarted) {
                throw "Processor already running";
            }

            this.eventListener = function (event) {
                _this.listener(event);
            };
            window.addEventListener("message", this.eventListener);
            this.isStarted = true;
        };

        MessageProcessor.prototype.stop = function () {
            this.throwIfNotStarted();

            window.removeEventListener("message", this.eventListener);
            this.isStarted = false;
        };

        MessageProcessor.prototype.sendMessage = function (data, callback) {
            this.throwIfNotStarted();

            var nextId = this.getNextMessageId();
            var message = new Message(nextId, this._labId, MessageType.Message, data);
            this.postMessage(message);
            this.messageMap[nextId] = callback;
        };
        return MessageProcessor;
    })();
    Labs.MessageProcessor = MessageProcessor;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsHostsCore.js.map

var Labs;
(function (Labs) {
    var InMemoryLabHost = (function () {
        function InMemoryLabHost(version) {
            this._labState = new Labs.InMemoryLabState();
            this._version = version;
        }
        //
        // Retrieves the version of the lab host
        //
        InMemoryLabHost.prototype.getSupportedVersions = function () {
            return [{ version: this._version }];
        };

        //
        // Initializes communication with the host
        //
        InMemoryLabHost.prototype.connect = function (versions, callback) {
            var connectionResponse = {
                initializationInfo: {
                    hostVersion: this._version
                },
                hostVersion: {
                    major: 0,
                    minor: 1
                },
                userInfo: {
                    id: "TestUserId",
                    permissions: [
                        Labs.Core.Permissions.Edit,
                        Labs.Core.Permissions.Take
                    ]
                },
                applicationId: "TestAppId",
                mode: Labs.Core.LabMode.Edit
            };
            setTimeout(function () {
                return callback(null, connectionResponse);
            }, 0);
        };

        //
        // Stops communication with the host
        //
        InMemoryLabHost.prototype.disconnect = function (completionStatus, callback) {
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };

        //
        // Adds an event handler for dealing with messages coming from the host. The resolved promsie
        // will be returned back to the host
        //
        InMemoryLabHost.prototype.on = function (handler) {
        };

        InMemoryLabHost.prototype.create = function (options, callback) {
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };

        //
        // Gets the current lab configuration from the host
        //
        InMemoryLabHost.prototype.getConfiguration = function (callback) {
            var configuration = this._labState.getConfiguration();
            setTimeout(function () {
                return callback(null, configuration);
            }, 0);
        };

        //
        // Sets a new lab configuration on the host
        //
        InMemoryLabHost.prototype.setConfiguration = function (configuration, callback) {
            this._labState.setConfiguration(configuration);
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };

        //
        // Gets the current state of the lab for the user
        //
        InMemoryLabHost.prototype.getState = function (callback) {
            var state = this._labState.getState();
            setTimeout(function () {
                return callback(null, state);
            });
        };

        //
        // Sets the state of the lab for the user
        //
        InMemoryLabHost.prototype.setState = function (state, callback) {
            this._labState.setState(state);
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };

        InMemoryLabHost.prototype.getConfigurationInstance = function (callback) {
            var configurationInstance = this._labState.getConfigurationInstance();
            setTimeout(function () {
                return callback(null, configurationInstance);
            }, 0);
        };

        InMemoryLabHost.prototype.takeAction = function (type, options, result, callback) {
            var translatedCallback = callback !== undefined ? callback : result;
            var translatedResult = callback !== undefined ? result : null;

            var action = this._labState.takeAction(type, options, translatedResult);
            setTimeout(function () {
                return translatedCallback(null, action);
            }, 0);
        };

        InMemoryLabHost.prototype.getActions = function (type, options, callback) {
            var actions = this._labState.getActions(type, options);
            setTimeout(function () {
                return callback(null, actions);
            }, 0);
        };
        return InMemoryLabHost;
    })();
    Labs.InMemoryLabHost = InMemoryLabHost;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    var InMemoryLabState = (function () {
        function InMemoryLabState() {
            this._configuration = null;
            this._configurationInstance = null;
            this._state = null;
            this._actions = [];
            this._nextId = 0;
            this._attemptMap = {};
        }
        InMemoryLabState.prototype.getConfiguration = function () {
            return this._configuration;
        };

        InMemoryLabState.prototype.setConfiguration = function (configuration) {
            this._configuration = configuration;
            this._configurationInstance = null;
            this._state = null;
            this._actions = [];
            this._attemptMap = {};
        };

        InMemoryLabState.prototype.getState = function () {
            return this._state;
        };

        InMemoryLabState.prototype.setState = function (state) {
            return this._state = state;
        };

        InMemoryLabState.prototype.getConfigurationInstance = function () {
            if (!this._configurationInstance) {
                this._configurationInstance = this.getConfigurationInstanceFromConfiguration(this._configuration);
            }

            return this._configurationInstance;
        };

        InMemoryLabState.prototype.getConfigurationInstanceFromConfiguration = function (configuration) {
            var _this = this;
            var components = configuration.components.map(function (component, index) {
                return _this.getComponentInstanceFromComponent(component, index);
            });
            return {
                appVersion: configuration.appVersion,
                components: components,
                name: configuration.name,
                timeline: configuration.timeline
            };
        };

        InMemoryLabState.prototype.getComponentInstanceFromComponent = function (component, index) {
            var instance = JSON.parse(JSON.stringify(component));
            instance.componentId = index.toString();

            if (component.type == Labs.Components.ChoiceComponentType) {
                instance.type = Labs.Components.ChoiceComponentInstanceType;
            } else {
                instance.type = Labs.Components.ActivityComponentInstanceType;
            }

            for (var key in instance.values) {
                var values = instance.values[key];
                for (var i = 0; i < values.length; i++) {
                    var valueId = this._nextId++;
                    values[i].valueId = valueId.toString();
                }
            }

            return instance;
        };

        InMemoryLabState.prototype.takeAction = function (type, options, result) {
            return this.takeActionCore(type, options, result);
        };

        InMemoryLabState.prototype.takeActionCore = function (type, options, result) {
            if (result === null) {
                if (type === Labs.Core.Actions.CreateAttemptAction) {
                    var attemptId = this._nextId++;
                    var createResult = {
                        attemptId: attemptId.toString()
                    };

                    this._attemptMap[attemptId.toString()] = (options).componentId;
                    result = createResult;
                } else if (type === Labs.Core.Actions.GetValueAction) {
                    var optionsAsGetValueOptions = options;
                    var getValueResult = {
                        value: this.findConfigurationValue(optionsAsGetValueOptions.attemptId, optionsAsGetValueOptions.valueId)
                    };

                    result = getValueResult;
                }
            }

            // Store and return the completed action
            var completedAction = {
                type: type,
                options: options,
                result: result,
                time: Date.now()
            };
            this._actions.push(completedAction);

            return completedAction;
        };

        InMemoryLabState.prototype.findConfigurationValue = function (attemptId, valueId) {
            var componentId = parseInt(this._attemptMap[attemptId]);
            for (var key in this._configurationInstance.components[componentId].values) {
                var values = this._configurationInstance.components[componentId].values[key];
                for (var i = 0; i < values.length; i++) {
                    if (values[i].valueId === valueId) {
                        return values[i].value;
                    }
                }
            }

            throw "not found";
        };

        InMemoryLabState.prototype.getAllActions = function () {
            return this._actions;
        };

        InMemoryLabState.prototype.setActions = function (actions) {
            this._actions = actions;
        };

        InMemoryLabState.prototype.getActions = function (type, options) {
            var completedActions = [];
            var i;
            var completedAction;

            if (type === Labs.Core.GetActions.GetAttempt) {
                var actionAsGetAttempt = options;

                for (i = 0; i < this._actions.length; i++) {
                    completedAction = this._actions[i];
                    if ((completedAction.options).attemptId === actionAsGetAttempt.attemptId) {
                        completedActions.push(completedAction);
                    }
                }
            } else if (type === Labs.Core.GetActions.GetComponentActions) {
                var actionAsGetComponentActions = options;

                for (i = 0; i < this._actions.length; i++) {
                    completedAction = this._actions[i];
                    if (completedAction.type === actionAsGetComponentActions.action && (completedAction.options).componentId === actionAsGetComponentActions.componentId) {
                        completedActions.push(completedAction);
                    }
                }
            } else {
                throw "Unknown get results action";
            }

            // Return the final results
            return completedActions;
        };
        return InMemoryLabState;
    })();
    Labs.InMemoryLabState = InMemoryLabState;
})(Labs || (Labs = {}));
;

var Office;

var Labs;
(function (Labs) {
    ;

    var Resolver = (function () {
        function Resolver() {
            var _this = this;
            this._callbacks = [];
            this._isResolved = false;
            this.promise = {
                then: function (callback) {
                    _this._callbacks.push(callback);
                    if (_this._isResolved) {
                        _this.fireCallbacks();
                    }
                }
            };
        }
        Resolver.prototype.resolve = function (value) {
            this._isResolved = true;
            this._resolvedValue = value;
            this.fireCallbacks();
        };

        Resolver.prototype.fireCallbacks = function () {
            var _this = this;
            this._callbacks.forEach(function (callback) {
                callback(_this._resolvedValue);
            });

            this._callbacks = [];
        };
        return Resolver;
    })();
    Labs.Resolver = Resolver;
    ;

    var OfficeJSLabHost = (function () {
        function OfficeJSLabHost() {
            var _this = this;
            this._version = { version: { major: 0, minor: 1 } };
            var resolver = new Resolver();
            this._officeInitialized = resolver.promise;

            Office.initialize = function () {
                // retrieve the configuration - this will tell us if we have been published or not - and then
                // use this to determine which host to make use of
                var labsSettings = Office.context.document.settings.get(OfficeJSLabHost.SettingsKeyName);

                if (labsSettings && labsSettings.published) {
                    _this._labHost = new Labs.PostMessageLabHost(labsSettings.publishedAppId, parent.parent, "*");
                } else {
                    _this._labHost = new Labs.RichClientOfficeJSLabsHost(labsSettings ? labsSettings.configuration : null, labsSettings ? labsSettings.hostVersion : null);
                }

                // based on what happens here I think I want to split on which internal host I create
                resolver.resolve();
            };
        }
        OfficeJSLabHost.prototype.getSupportedVersions = function () {
            return [this._version];
        };

        OfficeJSLabHost.prototype.connect = function (versions, callback) {
            var _this = this;
            this._officeInitialized.then(function () {
                _this._labHost.connect(versions, callback);
            });
        };

        OfficeJSLabHost.prototype.disconnect = function (completionStatus, callback) {
            this._labHost.disconnect(completionStatus, callback);
        };

        OfficeJSLabHost.prototype.on = function (handler) {
            this._labHost.on(handler);
        };

        OfficeJSLabHost.prototype.create = function (options, callback) {
            this._labHost.create(options, callback);
        };

        OfficeJSLabHost.prototype.getConfiguration = function (callback) {
            this._labHost.getConfiguration(callback);
        };

        OfficeJSLabHost.prototype.setConfiguration = function (configuration, callback) {
            this._labHost.setConfiguration(configuration, callback);
        };

        OfficeJSLabHost.prototype.getConfigurationInstance = function (callback) {
            this._labHost.getConfigurationInstance(callback);
        };

        OfficeJSLabHost.prototype.getState = function (callback) {
            this._labHost.getState(callback);
        };

        OfficeJSLabHost.prototype.setState = function (state, callback) {
            this._labHost.setState(state, callback);
        };

        OfficeJSLabHost.prototype.takeAction = function (type, options, result, callback) {
            this._labHost.takeAction(type, options, result, callback);
        };

        OfficeJSLabHost.prototype.getActions = function (type, options, callback) {
            this._labHost.getActions(type, options, callback);
        };
        OfficeJSLabHost.SettingsKeyName = "__labs__";
        return OfficeJSLabHost;
    })();
    Labs.OfficeJSLabHost = OfficeJSLabHost;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    /**
    * PostMessageLabHost - ILabHost that uses PostMessage for its communication mechanism
    */
    var PostMessageLabHost = (function () {
        function PostMessageLabHost(labId, targetWindow, targetOrigin) {
            var _this = this;
            this._handlers = [];
            this._version = { version: { major: 0, minor: 1 } };
            // Start the message processor and listen for messages
            this._messageProcessor = new Labs.MessageProcessor(labId, targetWindow, targetOrigin, function (data, callback) {
                _this.handleEvent(data, callback);
            });
        }
        PostMessageLabHost.prototype.handleEvent = function (command, callback) {
            this._handlers.map(function (handler) {
                handler(command.type, command.commandData);
            });

            callback(null, null);
        };

        PostMessageLabHost.prototype.getSupportedVersions = function () {
            return [this._version];
        };

        PostMessageLabHost.prototype.connect = function (versions, callback) {
            var _this = this;
            this._messageProcessor.start();

            // send the initialize message
            var initializeMessage = new Labs.Command(Labs.CommandType.Connect, this._version);
            this._messageProcessor.sendMessage(initializeMessage, function (err, connectionResponse) {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (connectionResponse.hostVersion.major !== _this._version.version.major) {
                    callback("Unsupported post message host", null);
                    return;
                }

                setTimeout(function () {
                    return callback(err, connectionResponse);
                }, 0);
            });
        };

        PostMessageLabHost.prototype.disconnect = function (completionStatus, callback) {
            var _this = this;
            var doneCommand = new Labs.Command(Labs.CommandType.Disconnect, completionStatus);
            this._messageProcessor.sendMessage(doneCommand, function (err, data) {
                _this._messageProcessor.stop();
                callback(err, data);
            });
        };

        PostMessageLabHost.prototype.on = function (handler) {
            this._handlers.push(handler);
        };

        PostMessageLabHost.prototype.create = function (options, callback) {
            var createCommand = new Labs.Command(Labs.CommandType.Create, options);
            this.sendCommand(createCommand, callback);
        };

        //
        // Gets the current lab configuration from the host
        //
        PostMessageLabHost.prototype.getConfiguration = function (callback) {
            var getConfigurationCommand = new Labs.Command(Labs.CommandType.GetConfiguration);
            this.sendCommand(getConfigurationCommand, callback);
        };

        //
        // Sets a new lab configuration on the host
        //
        PostMessageLabHost.prototype.setConfiguration = function (configuration, callback) {
            var setConfigurationCommand = new Labs.Command(Labs.CommandType.SetConfiguration, configuration);
            this.sendCommand(setConfigurationCommand, callback);
        };

        PostMessageLabHost.prototype.getConfigurationInstance = function (callback) {
            var getConfigurationInstanceCommand = new Labs.Command(Labs.CommandType.GetConfigurationInstance);
            this.sendCommand(getConfigurationInstanceCommand, callback);
        };

        //
        // Gets the current state of the lab for the user
        //
        PostMessageLabHost.prototype.getState = function (callback) {
            var getStateCommand = new Labs.Command(Labs.CommandType.GetState);
            this.sendCommand(getStateCommand, callback);
        };

        //
        // Sets the state of the lab for the user
        //
        PostMessageLabHost.prototype.setState = function (state, callback) {
            var setStateCommand = new Labs.Command(Labs.CommandType.SetState, state);
            this.sendCommand(setStateCommand, callback);
        };

        PostMessageLabHost.prototype.takeAction = function (type, options, result, callback) {
            var commandData = {
                type: type,
                options: options,
                result: callback !== undefined ? result : null
            };

            var takeActionCommand = new Labs.Command(Labs.CommandType.TakeAction, commandData);
            this.sendCommand(takeActionCommand, callback !== undefined ? callback : result);
        };

        PostMessageLabHost.prototype.getActions = function (type, options, callback) {
            var commandData = {
                type: type,
                options: options
            };

            var getCompletedActionsCommand = new Labs.Command(Labs.CommandType.GetCompletedActions, commandData);
            this.sendCommand(getCompletedActionsCommand, callback);
        };

        PostMessageLabHost.prototype.sendCommand = function (command, callback) {
            this._messageProcessor.sendMessage(command, callback);
        };
        return PostMessageLabHost;
    })();
    Labs.PostMessageLabHost = PostMessageLabHost;
})(Labs || (Labs = {}));
var Labs;
(function (Labs) {
    var RichClientOfficeJSLabsHost = (function () {
        function RichClientOfficeJSLabsHost(configuration, createdHostVersion) {
            var _this = this;
            this._handlers = [];
            this._version = { version: { major: 0, minor: 1 } };
            this._labState = new Labs.InMemoryLabState();
            this._labState.setConfiguration(configuration);
            this._createdHostVersion = createdHostVersion;

            // Get the current active view and pass it to the initialization method
            var activeViewResolver = new Labs.Resolver();
            Office.context.document.getActiveViewAsync(function (result) {
                _this._activeMode = _this.getLabModeFromActiveView(result.value);
                activeViewResolver.resolve(result.value);
            });

            // And also listen for updates
            Office.context.document.addHandlerAsync("activeViewChanged", function (args) {
                _this._activeMode = _this.getLabModeFromActiveView(args.activeView);

                _this._handlers.forEach(function (handler) {
                    handler(Labs.CommandType.ModeChanged, { mode: Labs.Core.LabMode[_this._activeMode] });
                });
            });
        }
        RichClientOfficeJSLabsHost.prototype.getLabModeFromActiveView = function (view) {
            return view === 'edit' ? Labs.Core.LabMode.Edit : Labs.Core.LabMode.View;
        };

        RichClientOfficeJSLabsHost.prototype.getSupportedVersions = function () {
            return [this._version];
        };

        RichClientOfficeJSLabsHost.prototype.connect = function (versions, callback) {
            // verify versions are supported
            var connectionResponse = {
                initializationInfo: {
                    hostVersion: this._createdHostVersion
                },
                hostVersion: {
                    major: 0,
                    minor: 1
                },
                userInfo: {
                    id: "TestUserId",
                    permissions: [
                        Labs.Core.Permissions.Edit,
                        Labs.Core.Permissions.Take
                    ]
                },
                applicationId: "TestAppId",
                mode: Labs.Core.LabMode.Edit
            };

            setTimeout(function () {
                return callback(null, connectionResponse);
            }, 0);
        };

        RichClientOfficeJSLabsHost.prototype.disconnect = function (completionStatus, callback) {
            var nextSlide = Office.Index.Next;
            Office.context.document.goToByIdAsync(nextSlide, Office.GoToType.Index);
            setTimeout(function () {
                return callback(null, null);
            }, 0);
        };

        RichClientOfficeJSLabsHost.prototype.on = function (handler) {
            this._handlers.push(handler);
        };

        RichClientOfficeJSLabsHost.prototype.create = function (options, callback) {
            // Store the options in the config settings. replace anything that is already there
            this._createdHostVersion = this._version.version;
            this.updateStoredLabsState(callback);
        };

        RichClientOfficeJSLabsHost.prototype.getConfiguration = function (callback) {
            var _this = this;
            setTimeout(function () {
                return callback(null, _this._labState.getConfiguration());
            }, 0);
        };

        RichClientOfficeJSLabsHost.prototype.setConfiguration = function (configuration, callback) {
            this._labState.setConfiguration(configuration);
            this.updateStoredLabsState(callback);
        };

        RichClientOfficeJSLabsHost.prototype.updateStoredLabsState = function (callback) {
            var settings = {
                configuration: this._labState.getConfiguration(),
                hostVersion: this._createdHostVersion
            };

            Office.context.document.settings.set(Labs.OfficeJSLabHost.SettingsKeyName, settings);
            Office.context.document.settings.saveAsync(function (asyncResult) {
                setTimeout(function () {
                    return callback(asyncResult.status === Office.AsyncResultStatus.Failed ? asyncResult.status : null, null);
                }, 0);
            });
        };

        RichClientOfficeJSLabsHost.prototype.getConfigurationInstance = function (callback) {
            var _this = this;
            setTimeout(function () {
                return callback(null, _this._labState.getConfigurationInstance());
            });
        };

        RichClientOfficeJSLabsHost.prototype.getState = function (callback) {
            var _this = this;
            setTimeout(function () {
                return callback(null, _this._labState.getState());
            });
        };

        RichClientOfficeJSLabsHost.prototype.setState = function (state, callback) {
            this._labState.setState(state);
            setTimeout(function () {
                return callback(null, null);
            });
        };

        RichClientOfficeJSLabsHost.prototype.takeAction = function (type, options, result, callback) {
            var translatedCallback = callback !== undefined ? callback : result;
            var translatedResult = callback !== undefined ? result : null;

            var action = this._labState.takeAction(type, options, translatedResult);
            setTimeout(function () {
                return translatedCallback(null, action);
            });
        };

        RichClientOfficeJSLabsHost.prototype.getActions = function (type, options, callback) {
            var _this = this;
            setTimeout(function () {
                return callback(null, _this._labState.getActions(type, options));
            });
        };
        return RichClientOfficeJSLabsHost;
    })();
    Labs.RichClientOfficeJSLabsHost = RichClientOfficeJSLabsHost;
})(Labs || (Labs = {}));
//# sourceMappingURL=LabsHosts.js.map

var LabsServer;
(function (LabsServer) {
    var LabHost = (function () {
        function LabHost(appId, processor) {
            this._isStarted = false;
            this._appId = appId;
            this._processor = processor;
        }
        LabHost.prototype.handleEvent = function (data, callback) {
            var command = data;
            var handledP = null;

            switch (command.type) {
                case Labs.CommandType.Connect:
                    handledP = this._processor.handleConnect(command.commandData);
                    break;

                case Labs.CommandType.Disconnect:
                    this._messageProcessor.stop();
                    handledP = this._processor.handleDisconnect(command.commandData);
                    break;

                case Labs.CommandType.Create:
                    handledP = this._processor.handleCreate(command.commandData);
                    break;

                case Labs.CommandType.GetConfigurationInstance:
                    handledP = this._processor.handleGetConfigurationInstance();
                    break;

                case Labs.CommandType.TakeAction:
                    handledP = this._processor.handleTakeAction(command.commandData);
                    break;

                case Labs.CommandType.GetCompletedActions:
                    handledP = this._processor.handleGetActions(command.commandData);
                    break;

                case Labs.CommandType.GetState:
                    handledP = this._processor.handleGetState();
                    break;

                case Labs.CommandType.SetState:
                    handledP = this._processor.handleSetState(command.commandData);
                    break;

                case Labs.CommandType.GetConfiguration:
                    handledP = this._processor.handleGetConfiguration();
                    break;

                case Labs.CommandType.SetConfiguration:
                    handledP = this._processor.handleSetConfiguration(command.commandData);
                    break;

                default:
                    var deferred = $.Deferred();
                    deferred.reject({ message: "Unknown Command" });
                    handledP = deferred.promise();
                    break;
            }

            handledP.then(function (result) {
                return callback(null, result);
            }, function (err) {
                return callback(err, null);
            });
        };

        LabHost.prototype.sendMessage = function (data) {
            var deferred = $.Deferred();
            this._messageProcessor.sendMessage(data, function (err, sendMessageData) {
                if (err) {
                    deferred.fail(err);
                } else {
                    deferred.resolve(sendMessageData);
                }
            });

            return deferred.promise();
        };

        LabHost.prototype.start = function () {
            var _this = this;
            if (this._isStarted) {
                throw "LabHost already started";
            }
            this._isStarted = true;

            this._messageProcessor = new Labs.MessageProcessor(this._appId, null, "*", function (data, callback) {
                _this.handleEvent(data, callback);
            });
            this._messageProcessor.start();
        };

        LabHost.prototype.stop = function () {
            if (!this._isStarted) {
                throw "LabHost is not running";
            }
            this._isStarted = false;

            this._messageProcessor.stop();
        };
        return LabHost;
    })();
    LabsServer.LabHost = LabHost;
})(LabsServer || (LabsServer = {}));
//# sourceMappingURL=LabsServer.js.map
