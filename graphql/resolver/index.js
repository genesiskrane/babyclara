import { fileResolver } from "./file.resolver.js";

export const resolver = {
  Query: {
    ...fileResolver.Query,
  },

  Mutation: {},
};
