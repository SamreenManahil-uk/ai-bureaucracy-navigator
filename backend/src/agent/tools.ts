import { WorkflowModel } from "../models/Workflow";

export const getMyWorkflowsTool = async (userId: string) => {
  const workflows = await WorkflowModel.find({
    ownerId: userId,
  }).sort({ createdAt: -1 });

  return workflows.map((workflow) => ({
    id: workflow._id.toString(),
    title: workflow.title,
    status: workflow.status,
    steps: workflow.steps.map((step) => ({
      order: step.order,
      title: step.title,
      status: step.status,
    })),
  }));
};

export const updateWorkflowStepTool = async (
  userId: string,
  workflowId: string,
  stepOrder: number,
  status: "pending" | "in_progress" | "completed"
) => {
  const workflow = await WorkflowModel.findOne({
    _id: workflowId,
    ownerId: userId,
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const step = workflow.steps.find(
    (item) => item.order === stepOrder
  );

  if (!step) {
    throw new Error("Workflow step not found");
  }

  step.status = status;

  await workflow.save();

  return {
    workflowId: workflow._id.toString(),
    stepOrder,
    title: step.title,
    status: step.status,
  };
};
