const R = require("ramda");
const _isFunction = require("./internal/_isFunction");
const _isObject = require("./internal/_isObject");

module.exports = function compose(...args) {
    if (R.filter(_isFunction, args).length < args.length) {
        throw new Error(`Invalid Arguments. Expected functions but got: ${R.map(R.type, args)}`);
    }
    return initialContext => {
        return R.reduce(
            (ctx, fn) => {
                const ret = fn(ctx);
                return _isObject(ret)
                    ? R.mergeDeepRight(ctx, R.merge(ret, { __: ret }))
                    : R.merge(ctx, { __: ret });
            },
            initialContext,
            R.reverse(args)
        );
    };
};
