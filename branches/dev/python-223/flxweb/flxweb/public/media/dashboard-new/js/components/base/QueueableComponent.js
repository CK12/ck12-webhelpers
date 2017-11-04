import React, {Component} from 'react';
import { isNumber, isFunction, first, get } from 'lodash';
import { Promise } from 'bluebird';

const NOOP = (res)=>{res();};

// Cancellation is disabled by default
Promise.config({
    cancellation: true
});

function isPromise(item){
    const constructorName = get(item, 'constructor.name', false);
    return item instanceof Promise || constructorName === 'Promise';
}

export default class QueueableComponent extends Component {
    constructor(props) {
        super(props);

        this._queue = [];
        this._isMounted = false;

        // Alias
        this.queue = {
            get: this._getQueue.bind(this),
            add: this._addToQueue.bind(this),
            addPromise: this._addPromiseToQueue.bind(this),
            remove: null, // TODO add removal or autoremoval somehow
            clear: this._clearQueue.bind(this)
        };
    }

    componentDidMount(){
        this._isMounted = true;
    }

    componentWillUnmount(){
        this._isMounted = false;
        this._clearQueue();
    }

    _getQueue(){
        return this._queue;
    }

    _addPromiseToQueue(cb=NOOP){
        if(!isFunction(cb)){ throw new Error('Callback must be a function'); }

        return this._addToQueue(
            new Promise((resolve, reject, onCancel)=>{
                // Trigger callback if mounted
                if(this._isMounted){
                    cb(resolve, reject, onCancel);
                } else {
                    resolve();
                }
            })
        );
    }

    _addToQueue(...items){
        items.forEach((item)=>{
            if(isNumber(item) || isPromise(item)){
                this._queue.push(item);
            } else {
                throw new Error('Unsupported queueable type for ', item);
            }
        });

        if(items.length === 1 && isPromise(first(items))){
            return first(items);
        }
    }

    _clearQueue(){
        this._queue.forEach((item)=>{
            if(isNumber(item)){
                clearTimeout(item);
            } else if(isPromise(item)){
                item.cancel();
            }
        });
    }
}