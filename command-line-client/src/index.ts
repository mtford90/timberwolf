import yargs from "yargs";
import WebSocket from "ws";
import pkg from "../package.json";

// eslint-disable-next-line no-unused-expressions
yargs(process.argv)
  .command(
    "$0",
    "Send logs to timberwolf",
    (cmd) =>
      cmd
        .number("port")
        .demand(["id", "port"])
        .usage("timberwolf --id <id> --port <port>"),
    ({ id, port }) => {
      if (Number.isNaN(port)) {
        throw new Error(`Invalid port - must be an integer`);
      }

      const ws = new WebSocket(`http://localhost:${port}`);

      ws.on("open", () => {
        process.stdin.setEncoding("utf-8");
        process.stdin.on("data", (data) => {
          const text = data.toString().trim();
          if (text) {
            console.log(text);
            const message = {
              id,
              timestamp: Date.now(),
              text,
            };
            ws.send(JSON.stringify(message));
          }
        });
        process.stdin.resume();
        process.stdin.on("close", () => {
          ws.close();
        });
      });

      ws.on("error", (err) => {
        console.error(err);
        process.exit(1);
      });

      ws.on("close", () => {
        process.exit(0);
      });
    }
  )
  .version(pkg.version).argv;
