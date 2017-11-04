/// <reference path="../jquery/jquery.d.ts" />
declare module Labs {
    interface InitialState {
        mode: string;
    }
}
declare module Labs {
    interface IUserData {
        data?: any;
    }
}
declare module Labs {
    interface IEventCallback {
        (data: any): void;
    }
}
declare module Labs {
    interface ILabCallback<T> {
        (err: any, data: T): void;
    }
}
declare module Labs.Configuration {
    interface IComponent {
        type: string;
    }
}
declare module Labs.Configuration {
    interface IConfiguration extends Labs.IUserData {
        name: string;
        components: Configuration.IComponent[];
    }
}
declare module Labs.Configuration {
    interface ISection extends Configuration.IComponent, Labs.IUserData {
        name: string;
    }
}
declare module Labs.Results {
    interface IComponentResult {
        type: string;
    }
}
declare module Labs.Results {
    interface IResults extends Labs.IUserData {
        componentResults: Results.IComponentResult[];
    }
}
declare module Labs.Results {
    interface ISectionAttempt extends Labs.IUserData {
        problemResults: Results.IProblemResult[];
    }
}
declare module Labs.Results {
    interface ISectionResult extends Results.IComponentResult, Labs.IUserData {
    }
}
declare module Labs.Results {
    interface IProblemResult extends Results.IComponentResult, Labs.IUserData {
    }
}
declare module Labs.State {
    class IState {
        public data: any;
    }
}
declare module Labs.CommandType {
    var Initialize: string;
    var Done: string;
    var ModeChanged: string;
    var GetConfiguration: string;
    var SetConfiguration: string;
    var GetState: string;
    var SetState: string;
    var GetResults: string;
    var SetResults: string;
}
declare module Labs {
    class Command {
        public type: string;
        public commandData: any;
        constructor(type: string, commandData?: any);
    }
}
declare module LabsServer {
    interface ILabEventProcessor {
        handleInitialize(): JQueryPromise<Labs.InitialState>;
        handleDone(): JQueryPromise<void>;
        handleGetConfiguration(): JQueryPromise<Labs.Configuration.IConfiguration>;
        handleSetConfiguration(configuration: Labs.Configuration.IConfiguration): JQueryPromise<void>;
        handleGetState(): JQueryPromise<Labs.State.IState>;
        handleSetState(state: Labs.State.IState): JQueryPromise<void>;
        handleGetResults(): JQueryPromise<Labs.Results.IResults>;
        handleSetResults(results: Labs.Results.IResults): JQueryPromise<void>;
    }
}
declare module Labs {
    enum MessageType {
        Message,
        Completion,
        Failure,
    }
    class Message {
        public id: number;
        public type: MessageType;
        public payload: any;
        constructor(id: number, type: MessageType, payload: any);
    }
    interface IMessageHandler {
        (data: any, callback: Labs.ILabCallback<any>): void;
    }
    class MessageProcessor {
        public isStarted: boolean;
        public eventListener: EventListener;
        public targetWindow: Window;
        public nextMessageId: number;
        public messageMap: any;
        public targetOrigin: string;
        public messageHandler: IMessageHandler;
        constructor(targetWindow: Window, targetOrigin: string, messageHandler: IMessageHandler);
        private verifyStarted();
        private getNextMessageId();
        private parseOrigin(href);
        private listener(event);
        private postMessage(message);
        public start(): void;
        public stop(): void;
        public sendMessage(data: any, callback: Labs.ILabCallback<any>): void;
    }
}
declare module Labs {
    class ModeChangedEvent {
        public mode: string;
        constructor(mode: string);
    }
}
declare module Labs.LabMode {
    var Edit: string;
    var View: string;
}
declare module LabsServer {
    class LabHost {
        private _messageProcessor;
        private _labFrame;
        private _targetOrigin;
        private _isStarted;
        private _processor;
        constructor(processor: LabsServer.ILabEventProcessor, labFrame: Window, targetOrigin: string);
        private handleEvent(data, callback);
        public sendMessage(data: any): JQueryPromise<any>;
        public start(): void;
        public stop(): void;
    }
}
