const GRAPHQL_URL = "http://localhost:5000/graphql";

export type WorkflowStatus =
  | "draft"
  | "active"
  | "completed";

export type StepStatus =
  | "pending"
  | "in_progress"
  | "completed";

export type WorkflowStep = {
  order: number;
  title: string;
  description?: string;
  status: StepStatus;
  sourceChunkIndexes?: number[];
};

export type WorkflowItem = {
  id: string;
  title: string;
  summary: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
};

const getToken = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
};

const graphqlRequest = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error("GraphQL request failed");
  }

  if (payload.errors?.length) {
    throw new Error(
      payload.errors[0]?.message ||
        "GraphQL request failed"
    );
  }

  return payload.data;
};

export const getMyWorkflows = async (): Promise<
  WorkflowItem[]
> => {
  const data = await graphqlRequest<{
    myWorkflows: WorkflowItem[];
  }>(`
    query MyWorkflows {
      myWorkflows {
        id
        title
        summary
        status
        steps {
          order
          title
          description
          status
          sourceChunkIndexes
        }
      }
    }
  `);

  return data.myWorkflows;
};

export const updateWorkflowStepStatus = async (
  workflowId: string,
  stepOrder: number,
  status: StepStatus
): Promise<WorkflowItem> => {
  const data = await graphqlRequest<{
    updateWorkflowStepStatus: WorkflowItem;
  }>(
    `
      mutation UpdateWorkflowStepStatus(
        $workflowId: ID!
        $stepOrder: Int!
        $status: String!
      ) {
        updateWorkflowStepStatus(
          workflowId: $workflowId
          stepOrder: $stepOrder
          status: $status
        ) {
          id
          title
          summary
          status
          steps {
            order
            title
            description
            status
            sourceChunkIndexes
          }
        }
      }
    `,
    {
      workflowId,
      stepOrder,
      status,
    }
  );

  return data.updateWorkflowStepStatus;
};
