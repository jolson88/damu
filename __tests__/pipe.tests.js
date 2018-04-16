const D = require("../src/index");

describe("Pipe", () => {
    it("should pass context through in right order", () => {
        const p = D.pipe(
            ({ start }) => {
                return { next: start + 1 };
            },
            ({ next }) => {
                return { final: next + 1 };
            }
        );

        const ret = p({ start: 1 });

        expect(ret.start).toBe(1);
        expect(ret.next).toBe(2);
        expect(ret.final).toBe(3);
    });
    it("should clear out __ for each return value", () => {
        const p = D.pipe(
            ({ start }) => {
                return { next: start + 1 };
            },
            ({ next }) => {
                return { final: next + 1 };
            }
        );

        const ret = p({ start: 1 });

        expect(ret.__).toEqual({ final: 3 });
    });
    it("should work with promises", done => {
        const f = ({ x }) => {
            return {
                fx: x + 20
            };
        };
        const g = ({ fx }) => {
            return Promise.resolve({
                gx: fx * 2
            });
        };
        const h = ({ gx }) => {
            return {
                hx: gx * 2
            };
        };

        const p = D.pipe(f, g, h);
        p({ x: 1 })
            .then(ret => {
                expect(ret.x).toBe(1);
                expect(ret.fx).toBe(21);
                expect(ret.gx).toBe(42);
                expect(ret.hx).toBe(84);
                done();
            })
            .catch(done);
    });
});
