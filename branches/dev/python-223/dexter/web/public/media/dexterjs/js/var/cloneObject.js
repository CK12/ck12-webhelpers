define(function() {
    return function cloneObject(object) {
        try {
            var newObj = {};
            var key;
            for (key in object) if (object.hasOwnProperty(key)) {
                if (typeof object[key] === "object" && object[key] !== null) {
                    newObj[key] = cloneObject(object[key]);
                }
                else {
                    newObj[key] = object[key];
                }
            }
            return newObj;
        } catch(error) {
            console.log(error);
            throw new Error("Circular Objects Not Supported");
        }
    };
});
