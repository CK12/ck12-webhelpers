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
declare module Labs.Configuration {
    interface IChoice {
        id: string;
        text: string;
    }
}
declare module Labs.Configuration {
    interface IHint {
        text: string;
    }
}
declare module Labs.Configuration {
    class ActivityProblem implements Configuration.IProblem {
        public name: string;
        public data: any;
        public type: string;
        constructor(name: string, data: any);
    }
}
declare module Labs.Configuration {
    class ChoiceProblem implements Configuration.IProblem {
        public type: string;
        public data: any;
        public name: string;
        public maxScore: number;
        public timeLimit: number;
        public choices: Configuration.IChoice[];
        public hints: Configuration.IHint[];
        public maxAttempts: number;
        public answer: string[];
        constructor(name: string, choices: Configuration.IChoice[], hints: Configuration.IHint[], answer: string[], maxScore: number, maxAttempts: number, timeLimit: number, data: any);
    }
}
declare module Labs.Configuration {
    class DynamicSection implements Configuration.ISection {
        public type: string;
        public name: string;
        public data: any;
        public problem: Configuration.IProblem;
        constructor(name: string, data: any, problem: Configuration.IProblem);
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
    interface IProblem extends Configuration.IComponent, Labs.IUserData {
        name: string;
    }
}
declare module Labs.Configuration {
    interface ISection extends Configuration.IComponent, Labs.IUserData {
        name: string;
    }
}
declare module Labs.Configuration {
    class InputProblem implements Configuration.IProblem {
        public name: string;
        public maxScore: number;
        public timeLimit: number;
        public hints: Configuration.IHint[];
        public data: any;
        public type: string;
        constructor(name: string, maxScore: number, timeLimit: number, hints: Configuration.IHint[], data: any);
    }
}
declare module Labs.Configuration {
    class StaticSection implements Configuration.ISection {
        public name: string;
        public data: any;
        public problems: Configuration.IProblem[];
        public type: string;
        constructor(name: string, data: any, problems: Configuration.IProblem[]);
    }
}
declare module Labs.Results {
    interface IComponentResult {
        type: string;
    }
}
declare module Labs.Results {
    interface IActivityProblemResult extends Results.IProblemResult {
    }
}
declare module Labs.Results {
    class ActivityProblemResult implements Results.IActivityProblemResult {
        public type: string;
        public data: any;
        constructor(data: any);
    }
}
declare module Labs.Results {
    class ChoiceProblemAttempt implements Results.IChoiceProblemAttempt {
        public hintsUsed: Labs.IProblemHint[];
        public submissions: Results.IChoiceSubmission[];
        public startTime: number;
        public state: string;
        constructor(hints: Labs.IProblemHint[], submissions: Results.IChoiceSubmission[], startTime: number, state: string);
    }
}
declare module Labs.Results {
    class ChoiceProblemResult implements Results.IComponentResult {
        public type: string;
        public data: any;
        public attempts: Results.IChoiceProblemAttempt[];
        constructor(attempts: Results.IChoiceProblemAttempt[], data?: any);
    }
}
declare module Labs.Results {
    interface IChoiceProblemAttempt {
        hintsUsed: Labs.IProblemHint[];
        submissions: Results.IChoiceSubmission[];
        startTime: number;
        state: string;
    }
}
declare module Labs.Results {
    interface IChoiceProblemResult extends Results.IProblemResult {
        attempts: Results.IChoiceProblemAttempt[];
    }
}
declare module Labs.Results {
    interface IChoiceSubmission {
        score: number;
        submitTime: number;
        value: string[];
    }
}
declare module Labs {
    interface IProblemHint extends Labs.IUserData {
        time: number;
    }
}
declare module Labs.Results {
    interface IProblemResult extends Results.IComponentResult, Labs.IUserData {
    }
}
declare module Labs.Results {
    interface IInputProblemResult extends Results.IProblemResult {
        attempts: Results.IInputProblemAttempt[];
    }
}
declare module Labs.Results {
    class InputProblemResult implements Results.IInputProblemResult {
        public type: string;
        public data: any;
        public attempts: Results.IInputProblemAttempt[];
        constructor(attempts?: Results.IInputProblemAttempt[], data?: any);
    }
}
declare module Labs.Results {
    class IInputProblemSubmission {
        public score: number;
        public submitTime: number;
        public value: string;
    }
}
declare module Labs.Results {
    interface IInputProblemAttempt {
        hintsUsed: Labs.IProblemHint[];
        submissions: Results.IInputProblemSubmission[];
        startTime: number;
        state: string;
    }
}
declare module Labs.Results {
    class InputProblemAttempt implements Results.IInputProblemAttempt {
        public hintsUsed: Labs.IProblemHint[];
        public submissions: Results.IInputProblemSubmission[];
        public startTime: number;
        public state: string;
        constructor(hints?: Labs.IProblemHint[], submissions?: Results.IInputProblemSubmission[], startTime?: number, state?: string);
    }
}
declare module Labs.Results {
    class DynamicSectionResult implements Results.ISectionResult {
        public type: string;
        public data: any;
        public problemResults: Results.IProblemResult[];
        constructor(problemResults?: Results.IProblemResult[], data?: any);
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
    interface IStaticSectionResult extends Results.ISectionResult {
        sectionAttempts: Results.ISectionAttempt[];
    }
}
declare module Labs.Results {
    class StaticSectionResult implements Results.IStaticSectionResult {
        public type: string;
        public data: any;
        public sectionAttempts: Results.ISectionAttempt[];
        constructor(attempts: Results.ISectionAttempt[]);
    }
}
declare module Labs.Results.ProblemState {
    var InProgress: string;
    var Timeout: string;
    var Completed: string;
}
declare module Labs.State {
    class IState {
        public data: any;
    }
}
declare module Labs {
    class EventTypes {
        static ModeChanged: string;
    }
}
declare module Labs {
    class ModeChangedEvent {
        public mode: string;
        constructor(mode: string);
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
declare module Labs.LabMode {
    var Edit: string;
    var View: string;
}
declare module Labs {
    class EventManager {
        public _handlers: any;
        private getHandler(event);
        public add(event: string, handler: (any: any) => JQueryPromise<any>): void;
        public remove(event: string, handler: (any: any) => JQueryPromise<any>): void;
        public fire(event: string, data: any): JQueryPromise<any>;
    }
}
declare module Labs {
    interface ILabHost {
        initialize(): JQueryPromise<Labs.InitialState>;
        stop(): JQueryPromise<void>;
        on(handler: (string: any, any: any) => JQueryPromise<any>);
        getConfiguration(): JQueryPromise<Labs.Configuration.IConfiguration>;
        setConfiguration(configuration: Labs.Configuration.IConfiguration): JQueryPromise<void>;
        getState(): JQueryPromise<Labs.State.IState>;
        setState(state: Labs.State.IState): JQueryPromise<void>;
        getResults(): JQueryPromise<Labs.Results.IResults>;
        setResults(results: Labs.Results.IResults): JQueryPromise<void>;
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
    class MessageProcessor {
        public isStarted: boolean;
        public eventListener: EventListener;
        public targetWindow: Window;
        public nextMessageId: number;
        public messageMap: any;
        public targetOrigin: string;
        public messageHandler: (data: any) => JQueryPromise<any>;
        constructor(targetWindow: Window, targetOrigin: string, messageHandler: (data: any) => JQueryPromise<any>);
        private verifyStarted();
        private getNextMessageId();
        private parseOrigin(href);
        private listener(event);
        private postMessage(message);
        public start(): void;
        public stop(): void;
        public sendMessage(data: any): JQueryPromise<any>;
    }
}
interface OfficeInterface {
    initialize: any;
    context: any;
    AsyncResultStatus: any;
    Index: any;
    GoToType: any;
}
declare var Office: OfficeInterface;
declare module Labs {
    class OfficeJSLabHost implements Labs.ILabHost {
        private _handlers;
        private _officeInitialized;
        constructor();
        private officeInitialized();
        public initialize(): JQueryPromise<Labs.InitialState>;
        public stop(): JQueryPromise<any>;
        public on(handler: (event: string, data: any) => JQueryPromise<any>): JQueryPromise<any>;
        public getConfiguration(): JQueryPromise<Labs.Configuration.IConfiguration>;
        public setConfiguration(configuration: Labs.Configuration.IConfiguration): JQueryPromise<void>;
        public getState(): JQueryPromise<Labs.State.IState>;
        public setState(state: Labs.State.IState): JQueryPromise<void>;
        public getResults(): JQueryPromise<Labs.Results.IResults>;
        public setResults(results: Labs.Results.IResults): JQueryPromise<void>;
    }
}
declare module Labs {
    class PostMessageLabHost implements Labs.ILabHost {
        private _handlers;
        private _messageProcessor;
        constructor(targetWindow: Window, targetOrigin: string);
        private handleEvent(command);
        public initialize(): JQueryPromise<Labs.InitialState>;
        public stop(): JQueryPromise<any>;
        public on(handler: (event: string, data: any) => JQueryPromise<any>): void;
        public getConfiguration(): JQueryPromise<Labs.Configuration.IConfiguration>;
        public setConfiguration(configuration: Labs.Configuration.IConfiguration): JQueryPromise<void>;
        public getState(): JQueryPromise<Labs.State.IState>;
        public setState(state: Labs.State.IState): JQueryPromise<void>;
        public getResults(): JQueryPromise<Labs.Results.IResults>;
        public setResults(results: Labs.Results.IResults): JQueryPromise<void>;
        private sendCommand(command);
    }
}
declare module Labs {
    class LabHost implements Labs.ILabHost {
        private _host;
        constructor();
        public initialize(): JQueryPromise<Labs.InitialState>;
        public stop(): JQueryPromise<void>;
        public on(handler: (string: any, any: any) => JQueryPromise<any>);
        public getConfiguration(): JQueryPromise<Labs.Configuration.IConfiguration>;
        public setConfiguration(configuration: Labs.Configuration.IConfiguration): JQueryPromise<void>;
        public getState(): JQueryPromise<Labs.State.IState>;
        public setState(state: Labs.State.IState): JQueryPromise<void>;
        public getResults(): JQueryPromise<Labs.Results.IResults>;
        public setResults(results: Labs.Results.IResults): JQueryPromise<void>;
    }
}
declare module Labs {
    function initialize(labHost: ILabHost): JQueryPromise<InitialState>;
    function done(): JQueryPromise<void>;
    function on(event: string, handler: (any: any) => JQueryPromise<any>): void;
    function off(event: string, handler: (any: any) => JQueryPromise<any>): void;
    function getConfiguration(): JQueryPromise<Configuration.IConfiguration>;
    function setConfiguration(configuration: Configuration.IConfiguration): JQueryPromise<void>;
    function getState(): JQueryPromise<State.IState>;
    function setState(state: State.IState): JQueryPromise<void>;
    function getResults(): JQueryPromise<Results.IResults>;
    function setResults(results: Results.IResults): JQueryPromise<void>;
}
