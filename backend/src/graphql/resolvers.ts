import { WorkflowModel } from "../models/Workflow";

type GraphQLContext = {
  userId?: string;
  role?: "USER" | "ADMIN";
};

export const resolvers = {
  Workflow: {
    id: (workflow: { _id: { toString(): string } }) =>
      workflow._id.toString(),

    createdAt: (workflow: { createdAt: Date }) =>
      workflow.createdAt.toISOString(),

    updatedAt: (workflow: { updatedAt: Date }) =>
      workflow.updatedAt.toISOString(),
  },

  Query: {
    myWorkflows: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      return WorkflowModel.find({
        ownerId: context.userId,
      }).sort({ createdAt: -1 });
    },

    workflow: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      return WorkflowModel.findOne({
        _id: args.id,
        ownerId: context.userId,
      });
    },
  },

  Mutation: {
    updateWorkflowStepStatus: async (
      _: unknown,
      args: {
        workflowId: string;
        stepOrder: number;
        status: string;
      },
      context: GraphQLContext
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      const allowedStatuses = [
        "pending",
        "in_progress",
        "completed",
      ];

      if (!allowedStatuses.includes(args.status)) {
        throw new Error("Invalid workflow step status");
      }

      const workflow = await WorkflowModel.findOne({
        _id: args.workflowId,
        ownerId: context.userId,
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const step = workflow.steps.find(
        (item) => item.order === args.stepOrder
      );

      if (!step) {
        throw new Error("Workflow step not found");
      }

      step.status = args.status as
        | "pending"
        | "in_progress"
        | "completed";

      await workflow.save();

      return workflow;
    },
  },
};
