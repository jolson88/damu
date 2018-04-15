const R = require("ramda");
const { kompose } = require("../src/kompose");

describe("Kompose", () => {
    it("should work with single function", () => {
        const k = kompose(({ bar }) => {
            return {
                foo: 41 + bar
            };
        });

        const ret = k({ bar: 1 });

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

        const ret = kompose(greet, getUser)({ userId: "jolson88" });

        expect(ret.greeting).toBe("Hello, Jason");
    });
    it("should make previous return available via __", () => {
        const k = kompose(
            ({ __ }) => {
                return {
                    greeting: __
                };
            },
            ({ name }) => {
                return `Hello, ${name}`;
            }
        );

        const ret = k({ name: "Jason" });

        expect(ret.greeting).toEqual("Hello, Jason");
    });
    it("should validate parameters are functions", () => {
        expect(() => {
            kompose(() => 42, 35);
        }).toThrowError("Invalid Argument");
        expect(() => {
            kompose({});
        }).toThrowError("Invalid Argument");
        expect(() => {
            kompose([1, 2, 3]);
        }).toThrowError("Invalid Argument");
    });
});
