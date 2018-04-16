const R = require("ramda");
const D = require("../src/index");

describe("Compose", () => {
    it("should work with single function", () => {
        const c = D.compose(({ bar }) => {
            return {
                foo: 41 + bar
            };
        });

        const ret = c({ bar: 1 });

        expect(ret.foo).toBe(42);
        expect(ret.bar).toBe(1);
    });
    it("should work with multiple functions", () => {
        const users = [
            { login: "jolson88", name: "Jason" },
            { login: "willowhaven", name: "Rebecca" }
        ];
        const getUser = ({ userId }) => {
            return {
                user: R.find(R.propEq("login", userId), users)
            };
        };
        const greet = ({ user: { name } }) => {
            return {
                greeting: `Hello, ${name}`
            };
        };

        const ret = D.compose(greet, getUser)({ userId: "jolson88" });

        expect(ret.greeting).toBe("Hello, Jason");
    });
    it("should make previous return available via __", () => {
        const c = D.compose(
            ({ __ }) => {
                return {
                    greeting: __
                };
            },
            ({ name }) => {
                return `Hello, ${name}`;
            }
        );

        const ret = c({ name: "Jason" });

        expect(ret.greeting).toEqual("Hello, Jason");
    });
    it("should validate parameters are functions", () => {
        expect(() => {
            D.compose(() => 42, 35);
        }).toThrowError("Invalid Argument");
        expect(() => {
            D.compose({});
        }).toThrowError("Invalid Argument");
        expect(() => {
            D.compose([1, 2, 3]);
        }).toThrowError("Invalid Argument");
    });
});
