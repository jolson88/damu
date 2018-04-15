const R = require("ramda");
const { wrap } = require("../src/wrap");

describe("Wrap", () => {
    it("should merge result into context", () => {
        const fn = wrap(() => {
            return {
                bar: 42
            };
        });

        const ret = fn({ foo: 1 });

        expect(ret.bar).toBe(42);
        expect(ret.foo).toBe(1);
    });
    it("should override previous value", () => {
        const fn = wrap(() => {
            return {
                foo: 2
            };
        });

        const ret = fn({ foo: 1 });

        expect(ret.foo).toBe(2);
    });
    it("should preserve non-overridden child fields", () => {
        const fn = wrap(() => {
            return {
                foo: {
                    bar: 42
                }
            };
        });

        const ret = fn({ foo: { baz: 1 } });

        expect(ret.foo.bar).toBe(42);
        expect(ret.foo.baz).toBe(1);
    });
    it("should not swallow thrown exceptions", () => {
        const fn = wrap(() => {
            throw new Error("Oops");
        });

        expect(() => fn()).toThrow();
    });
    it("should make last value available in _", () => {
        const fn = wrap(() => {
            return 42;
        });

        const ret = fn();

        expect(ret.__).toBe(42);
    });
    it("should only merge when return value is an object", () => {
        const fn = wrap(() => {
            return [1, 2, 3];
        });

        const ret = fn({ foo: 42 });

        expect(ret.__).toEqual([1, 2, 3]);
        expect(ret.foo).toBe(42);
        expect(R.keys(ret).length).toBe(2);
    });
});
