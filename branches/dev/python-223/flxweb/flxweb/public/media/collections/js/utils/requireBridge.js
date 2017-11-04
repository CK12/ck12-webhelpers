/*global requirejs */

// NOTE: This file will act as a temporary bridge between the react functionality and the older code.
// You can add methods here that'd require modules or utilities from the older code.

import Promise from 'bluebird';



export const requireModule = (module) => {
  return new Promise((resolve, reject)=> {
    requirejs(['main'], ()=>{
      requirejs([module], (moduleRef) => {
        resolve(moduleRef);
      }, (err)=> {
        reject(err);
      });
    });
  });
};

export const openLTIWindow = (href) => {
  requireModule('ltiBridge').then((ltiBridge) => {
    var other_window = window.open(href,'lms-context-ref');
    // List for postmessage from other window
    // to receive info needed to create the assignment
    // for lms using bridge
    try {
      let LTIBridge = new ltiBridge();
      window.addEventListener('message', function(event) {
        console.log('Received post message');
        if (event.origin !== window.origin && event.origin.slice(-8) !== window.origin.slice(-8)) {
          return;
        }
        LTIBridge.onAssignAction(JSON.parse(event.data));
        other_window.close();
      });
    } catch(e) {
      console.log('Error on create assignment via postmessage:' + String(e));
    }
  });
};
