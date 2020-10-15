import { withFilter } from "graphql-subscriptions";
import { LogsPublisher } from "../../publishers/logs-publisher";
import {
  Subscription,
  SubscriptionLogsArgs,
} from "../../../../graphql-types.generated";

export function logsSubscriptionResolver(
  getLogsAsyncIterator: () => ReturnType<LogsPublisher["asyncIterator"]>
) {
  return {
    subscribe: withFilter(
      getLogsAsyncIterator,
      (
        payload: Pick<Subscription, "logs">,
        variables: SubscriptionLogsArgs
      ) => {
        const log = payload.logs;

        if (!log) return false;

        if (variables.filter) {
          const match = log.text.indexOf(variables.filter) > -1;
          if (!match) return false;
        }

        if (variables.sourceId) {
          const match = log.source.id === variables.sourceId;
          if (!match) return false;
        }

        return true;
      }
    ),
  };
}
