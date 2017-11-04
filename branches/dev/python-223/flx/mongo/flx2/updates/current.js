// 
// Add your patches to the list below - one per line.
// The patch file should be relative to the current directory. (eg: "./20170501-test.js")
// Make sure to NOT have a trailing comma in this list
//

var PATCHES = [
    //"./20170502-test.js"
];




//
// DO NOT CHANGE ANYTHING BELOW THIS LINE
//

var errors = 0;
// Ensure the index on Patches collection
db.Patches.ensureIndex({'name': 1}, {'unique': true});
print("");
for (var i=0; i < PATCHES.length; i++) {
    print("[" + (i+1) + "/" + PATCHES.length + "] Applying: " + PATCHES[i]);
    try {
        load(PATCHES[i]);
        db.Patches.update({'name': PATCHES[i]}, {'$set': {'name': PATCHES[i], 'applied': new Date()}}, {'upsert': true});
    } catch (e) {
        errors ++;
        print("Error: " + e);
    }
}
print("");
print("#############################################");
print("Done applying patches!");
print("Errors: " + errors + " out of " + PATCHES.length);
print("#############################################");
