import fs from "mz/fs";
import { Observable } from "rxjs";

const NEW_LINE_CHARACTERS = ["\n"];

async function readPreviousChar(
  fileSize: number,
  file: number,
  currentCharacterCount: number
) {
  const bytesReadAndBuffer = await fs.read(
    file,
    Buffer.alloc(1),
    0,
    1,
    fileSize - 1 - currentCharacterCount
  );

  return String.fromCharCode((bytesReadAndBuffer as never)[1][0]);
}

export function reverseRead(
  inputFilePath: string,
  encoding: BufferEncoding = "utf8"
): Observable<{ line?: string; bytesRead: number; size: number }> {
  return new Observable<{
    line?: string;
    bytesRead: number;
    size: number;
  }>((subscriber) => {
    let file: number | null = null;

    async function read() {
      const stats = await fs.stat(inputFilePath);
      file = await fs.open(inputFilePath, "r");
      const fileSize = stats.size;

      subscriber.next({ bytesRead: 0, size: fileSize });

      let chars = 0;
      let currentLine = "";

      function nextLine() {
        subscriber.next({
          line: Buffer.from(currentLine, "binary").toString(encoding),
          bytesRead: chars,
          size: fileSize,
        });
      }

      // eslint-disable-next-line no-restricted-syntax
      while (chars < fileSize) {
        // eslint-disable-next-line no-await-in-loop
        const nextCharacter = await readPreviousChar(fileSize, file, chars);
        const nextCharIsNewLine = NEW_LINE_CHARACTERS.includes(nextCharacter);
        chars++;
        if (nextCharIsNewLine) {
          nextLine();
          currentLine = "";
        } else {
          currentLine = nextCharacter + currentLine;
        }
      }

      if (currentLine.length) {
        nextLine();
      }
    }

    const promise = read();

    promise
      .then(() => {
        subscriber.complete();
      })
      .catch((err) => {
        subscriber.error(err);
      });

    return () => {
      promise.cancel();
      if (file) {
        // noinspection JSIgnoredPromiseFromCall
        fs.close(file);
      }
    };
  });
}
