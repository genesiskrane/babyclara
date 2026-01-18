// graphql/schema/index.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Make __dirname work in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load a file relative to this module
const loadFromModule = (file) =>
  fs.readFileSync(path.join(__dirname, file), "utf8");

// If you also want to support loading from the current working directory (optional):
// const loadFromCWD = (file) => fs.readFileSync(path.join(process.cwd(), "graphql/schema", file), "utf8");

// Merge your schema files
export const typeDefs = `
${loadFromModule("file.gql")}
${loadFromModule("query.gql")}
`;
