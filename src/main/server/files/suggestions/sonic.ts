// import { Search, Ingest } from "sonic-channel";
//
// export class Sonic {
//   private searchChannel: Search;
//
//   private ingestChannel: Ingest;
//
//   constructor(config: { host?: string; port?: number; auth?: string } = {}) {
//     const configWithDefaults = {
//       host: "::1",
//       port: 1491,
//       auth: "SecretPassword",
//       ...config,
//     };
//
//     this.searchChannel = new Search(configWithDefaults);
//     this.ingestChannel = new Ingest(configWithDefaults);
//   }
//
//   async connect(): Promise<void> {
//     await Promise.all([
//       new Promise((resolve, reject) => {
//         this.searchChannel.connect({
//           connected() {
//             resolve();
//           },
//           error(error) {
//             reject(error);
//           },
//         });
//       }),
//       new Promise((resolve, reject) => {
//         this.ingestChannel.connect({
//           connected() {
//             resolve();
//           },
//           error(error) {
//             reject(error);
//           },
//         });
//       }),
//     ]);
//   }
//
//   async disconnect(): Promise<void> {
//     await Promise.all([this.ingestChannel.close(), this.searchChannel.close()]);
//   }
//
//   store(tabId: string, logId: string, text: string): Promise<void> {
//     return this.ingestChannel.push("logs", tabId, logId, text);
//   }
//
//   clearAll(): Promise<number> {
//     return this.ingestChannel.flushc("logs");
//   }
//
//   clearTab(tabId: string): Promise<number> {
//     return this.ingestChannel.flushb("logs", tabId);
//   }
//
//   query(
//     tabId: string,
//     terms: string,
//     opts: { limit?: number; offset?: number } = {}
//   ): Promise<string[]> {
//     return this.searchChannel.query("logs", tabId, terms, opts);
//   }
//
//   suggest(tabId: string, word: string): Promise<string[]> {
//     return this.searchChannel.suggest("logs", tabId, word);
//   }
// }
