import { PubSub } from "graphql-subscriptions";
import { Trigger } from "../resolvers/types";
import { Subscription } from "../../../graphql-types.generated";

export abstract class Publisher<T extends Trigger> {
  private readonly pubSub: PubSub;

  private readonly trigger: T;

  protected constructor(trigger: T, pubSub: PubSub) {
    this.pubSub = pubSub;
    this.trigger = trigger;
  }

  protected publish(payload: Subscription[T]) {
    return this.pubSub.publish(this.trigger, { [this.trigger]: payload });
  }

  asyncIterator() {
    return this.pubSub.asyncIterator<Record<T, Subscription[T]>>(this.trigger);
  }

  [Symbol.asyncIterator]() {
    return this.asyncIterator();
  }

  abstract init(): void;

  abstract dispose(): void;
}
