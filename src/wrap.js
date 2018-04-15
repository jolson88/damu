const R = require("ramda");

const isObject = R.pipe(R.type, R.equals("Object"));

function wrap(fn) {
    return context => {
        const ret = fn(context);
        return isObject(ret)
            ? R.mergeDeepRight(context, R.merge(ret, { __: ret }))
            : R.merge(context, { __: ret });
    };
}

module.exports = {
    wrap
};
