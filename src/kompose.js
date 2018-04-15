const R = require("ramda");
const { wrap } = require("./wrap");

const filterToFunctions = R.filter(R.equals("Function"));

function kompose(...args) {
    const argTypes = R.map(R.type, args);
    if (args.length > filterToFunctions(argTypes).length) {
        throw new Error(`Invalid Argument error\n\nExpected functions but got: ${argTypes}`);
    }
    return ctx => {
        return R.reduce((ctx, fn) => wrap(fn)(ctx), ctx, R.reverse(args));
    };
}

module.exports = {
    kompose
};
