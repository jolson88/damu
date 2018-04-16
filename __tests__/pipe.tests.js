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
});
