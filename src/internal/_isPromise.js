const R = require("ramda");

module.exports = function _isPromise(x) {
    return R.type(x) === "Promise";
};
