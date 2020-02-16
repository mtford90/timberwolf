import { toArray } from "rxjs/operators";
import { reverseRead } from "./reverse-read";

const path = "/Users/mtford/Playground/log/log.txt";

describe("reverse read", () => {
  describe("with events", () => {
    describe("when reading a file", () => {
      it("should read all lines in the file", async () => {
        const lines = await reverseRead(path).pipe(toArray()).toPromise();

        console.log(lines.length);

        expect(lines).toMatchSnapshot();
      });
    });
  });
});
