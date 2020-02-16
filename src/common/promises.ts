import Bluebird from "bluebird";

if (typeof window === "undefined") {
  (global as any).Promise = Bluebird;
} else {
  (window as any).Promise = Bluebird;
}

Promise.config({
  longStackTraces: process.env.NODE_ENV !== "production",
  cancellation: true,
});
