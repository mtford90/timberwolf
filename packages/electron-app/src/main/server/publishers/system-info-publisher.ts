import { PubSub } from "graphql-subscriptions";
import { nativeTheme } from "electron";
import { reaction, IReactionDisposer } from "mobx";
import { Publisher } from "./publisher";
import { WebsocketServer } from "../websockets";
import { getExecutablePath } from "../resolvers/executable-path";

export class SystemInfoPublisher extends Publisher<"systemInfo"> {
  private websocketServer: WebsocketServer;

  private disposeWebsocketReaction?: IReactionDisposer;

  constructor({
    pubsub,
    websocketServer,
  }: {
    pubsub: PubSub;
    websocketServer: WebsocketServer;
  }) {
    super("systemInfo", pubsub);
    this.websocketServer = websocketServer;
  }

  init() {
    nativeTheme.on("updated", this.handleNativeThemeUpdate);
    this.disposeWebsocketReaction = reaction(
      () => this.websocketServer.port,
      () => {
        this.publishAll();
      }
    );
  }

  private handleNativeThemeUpdate = () => {
    this.publishAll();
  };

  private publishAll() {
    this.publish({
      __typename: "SystemInfo",
      darkModeEnabled: nativeTheme.shouldUseDarkColors,
      websocketPort: this.websocketServer.port,
      executablePath: getExecutablePath(),
    });
  }

  dispose() {
    nativeTheme.off("updated", this.handleNativeThemeUpdate);
    this.disposeWebsocketReaction?.();
  }
}
