const R = require("ramda");
const _isFunction = require("./internal/_isFunction");
const _isObject = require("./internal/_isObject");
const _isPromise = require("./internal/_isPromise");

function mergeIntoContext(ctx, ret) {
    return _isObject(ret)
        ? R.merge(R.mergeDeepRight(ctx, ret), { __: ret })
        : R.merge(ctx, { __: ret });
}

function run(ctx, fn) {
    const ret = fn(ctx);
    if (_isPromise(ret)) {
        return ret.then(retP => {
            return mergeIntoContext(ctx, retP);
        });
    } else {
        return mergeIntoContext(ctx, ret);
    }
}

module.exports = function compose(...args) {
    if (R.filter(_isFunction, args).length < args.length) {
        throw new Error(`Invalid Arguments. Expected functions but got: ${R.map(R.type, args)}`);
    }
    return initialContext => {
        return R.reduce(
            (ctx, fn) => {
                if (_isPromise(ctx)) {
                    return ctx.then(ctxP => {
                        return run(ctxP, fn);
                    });
                } else {
                    return run(ctx, fn);
                }
            },
            initialContext,
            R.reverse(args)
        );
    };
};
