function object(obj){
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    object: object
};