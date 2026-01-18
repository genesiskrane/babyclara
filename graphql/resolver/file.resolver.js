import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const fileResolver = {
  Subscription: {
    fileChanged: {
      subscribe: (_, { workstationId }) => pubsub.asyncIterator("FILE_CHANGED"),
    },
  },
};
