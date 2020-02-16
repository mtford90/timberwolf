// import { v4 as guid } from "uuid";
// import { Sonic } from "./sonic";
//
// describe("sonic", () => {
//   const sonic = new Sonic();
//
//   beforeAll(async () => {
//     await sonic.connect();
//   });
//
//   afterAll(async () => {
//     await sonic.clearAll();
//     await sonic.disconnect();
//   });
//
//   describe("query", () => {
//     describe("simple query", () => {
//       const tabId = guid();
//       const first = guid();
//       const second = guid();
//
//       beforeAll(async () => {
//         await Promise.all([
//           sonic.store(tabId, first, "my log"),
//           sonic.store(tabId, second, "123"),
//         ]);
//       });
//
//       it("should return relevent results", async () => {
//         const results = await sonic.query(tabId, "log");
//         console.log(results);
//         expect(results).toHaveLength(1);
//         expect(results[0]).toEqual(first);
//       });
//     });
//   });
//
//   describe("suggest", () => {
//     const tabId = guid();
//
//     beforeAll(async () => {
//       await Promise.all([
//         sonic.store(tabId, "1", "my log"),
//         sonic.store(tabId, "2", "my other log"),
//         sonic.store(tabId, "3", "my other great log"),
//         sonic.store(tabId, "4", "123"),
//       ]);
//     });
//
//     it("should return relevent results", async () => {
//       const suggestions = await sonic.suggest(tabId, "lo");
//       console.log(suggestions);
//     });
//   });
// });
