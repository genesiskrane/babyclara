import { readFileSync } from "fs";
import { join } from "path";

const load = (file) =>
  readFileSync(join(process.cwd(), "graphql/schema", file), "utf8");

export const typeDefs = `
  ${load("file.gql")}
  ${load("query.gql")}
`;
