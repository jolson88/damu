const R = require("ramda");
const compose = require("./compose");

module.exports = function pipe(...args) {
    return R.apply(compose, R.reverse(args));
};
