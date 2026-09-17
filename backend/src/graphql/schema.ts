import { gql } from "graphql-tag";

export const typeDefs = gql`
  type WorkflowStep {
    order: Int!
    title: String!
    description: String!
    status: String!
    sourceChunkIndexes: [Int!]!
  }

  type Workflow {
    id: ID!
    ownerId: ID!
    documentId: ID!
    title: String!
    summary: String!
    status: String!
    steps: [WorkflowStep!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    myWorkflows: [Workflow!]!
    workflow(id: ID!): Workflow
  }

  type Mutation {
    updateWorkflowStepStatus(
      workflowId: ID!
      stepOrder: Int!
      status: String!
    ): Workflow!
  }
`;
