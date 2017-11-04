//Common merge utility methods
define(function () {
    'use strict';
    var merge = {
        // accepts an array of objects and returns a merged array with the child node of each object filtered with the given key for 1 level
        mergeChildren: function (object, property) {
            var index, childIndex, retObj = [];
            for (index = 0; index < object.length; index++) {
                if (object[index].hasOwnProperty(property) && object[index][property] instanceof Array) {
                    for (childIndex = 0; childIndex < object[index][property].length; childIndex++) {
                        retObj.push(object[index][property][childIndex]);
                    }
                }
            }
            return retObj;
        },
        // accepts an array of objects and returns a merged array with the child node of each object filtered with the given key for recursive levels
        mergeChildrenRecursive: function (model, property) {

            function flattenNode(model, property, index) {
                var length, index2, temp = [];
                length = model.length;
                if (model[index].hasOwnProperty(property) && model[index][property] instanceof Array) {
                    for (index2 = index + 1; index2 < length; index2++) {
                        temp.unshift(model.pop());
                    }
                    model = model.concat(model[index][property]);
                    model = model.concat(temp);
                    temp = [];
                }
                return model;
            }

            var index;
            //first loop and remove cluster level nodes. we need their children
            var children = [];
            for (var i=0;i<model.length;i++) {
                if ('Cluster' === model[i].sourceLevel) {
                    children = children.concat( model[i].children );
                }
            }
            if(children.length > 0) {
                model = children;
            }
            for (index = 0; index < model.length; index++) {
                if (model[index].hasOwnProperty(property) && model[index][property] instanceof Array) {
                    if (model[index].hasOwnProperty('depth')) {
                        if (3 <= model[index].depth) {
                            model = flattenNode(model, property, index);
                        } else {
                            model[index][property] = this.mergeChildrenRecursive(model[index][property], property);
                        }
                    }
                }
            }
            return model;
        }
    };

    return merge;
});
