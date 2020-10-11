import { DocumentNode } from "graphql";

declare module "*.graphql" {
  const content: DocumentNode;
  export default content;
}

declare module "*.gql" {
  const content: DocumentNode;
  export default content;
}
