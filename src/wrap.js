const R = require("ramda");

function wrap(fn) {
    return context => {
        const ret = fn(context);
        return R.mergeDeepRight(context, R.merge(ret, { __: ret }));
    };
}

module.exports = {
    wrap
};
