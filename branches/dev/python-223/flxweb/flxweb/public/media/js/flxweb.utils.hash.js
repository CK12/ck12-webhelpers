//
// Implements a java script based hash object similar to Java's HashMap or Python dict object
// Author: Nimish Pachapurkar <nimish@ck12.org>
// Inspired by Hash() object in PrototypeJS
//

function Hash() {
    this.dict = {};
    this.length = 0;
}

// Get value for a key - null if key does not exist
Hash.prototype.get = function(key) {
    if (key in this.dict) {
        return this.dict[key];
    }
    return null;
}

// Set value for a new or existing key
Hash.prototype.set = function(key, obj) {
    if (! this.hasKey(key)) {
        this.length ++;
    }
    this.dict[key] = obj;
}

// Unset or remove a key
Hash.prototype.unset = function(key) {
    if (this.hasKey(key)) {
        delete this.dict[key];
        this.length --;
    }
}

// Same as unset - an alias
Hash.prototype.remove = function(key) {
    this.unset(key);
}

// Get an array of values contained within the hash
// Order of values is arbitrary
Hash.prototype.values = function() {
    values = [];
    for (var key in this.dict) {
        if (this.dict.hasOwnProperty(key)) {
            values.push(this.dict[key]);
        }
    }
    return values;
}

// Get an array of keys contained within the hash
// Order of keys is arbitrary
Hash.prototype.keys = function() {
    keys = [];
    for (var key in this.dict) {
        if (this.dict.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

// Check if a key exists in this hash
Hash.prototype.hasKey = function(key) {
    return key in this.dict && this.dict.hasOwnProperty(key);
}

//
// Self test functions
//

Hash.prototype.__assert = function(cond, msg, success) {
    if (!cond) {
        alert('ERROR: ' + msg);
    } else {
        if (success) {
            console.log('Success: ' + success);
        } else {
            console.log('Assertion passed.');
        }
    }
    return cond;
}

Hash.prototype.__selfTest = function() {
    var errs = 0;

    h = new Hash();
    this.__assert(h.length == 0, 'Wrong length (expected: 0)', 'Hash length 0 on init as expected.') || errs++;

    h.unset('name');
    h.set('name', 'hash object');
    this.__assert(h.length == 1, 'Wrong length (expected: 1)') || errs++;

    this.__assert(h.get('name') == 'hash object', 'Incorrect value returned') || errs++;

    h.unset('name');
    this.__assert(h.length == 0, 'Wrong length (expected: 0)') || errs++;
    this.__assert(h.get('name') == null, 'Incorrect value returned') || errs++;

    h.set('age', 1);
    h.set('age', 2);
    this.__assert(h.length == 1, 'Wrong length (expected: 1)') || errs++;
    this.__assert(h.get('age') == 2, 'Incorrect value returned') || errs++;

    vals = h.values();
    keys = h.keys();
    this.__assert(h.hasKey('age'), 'hasKey check failed.') || errs++;
    for (var v in vals) {
        this.__assert(vals[v] == 2, 'Incorrect values returned.') || errs++;
    }
    for (var k in keys) {
        this.__assert(keys[k] == 'age' || 'Incorrect keys returned.') || errs++;
    }

    h.remove('age');
    this.__assert(h.length == 0, 'Wrong length (expected: 0)') || errs++;

    this.__assert(errs == 0, 'Some tests failed: ' + errs, 'All tests passed successful');
}

