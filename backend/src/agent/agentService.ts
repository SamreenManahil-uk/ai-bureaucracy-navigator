import {
  getMyWorkflowsTool,
  updateWorkflowStepTool,
} from "./tools";

type ToolCall = {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
};

type OllamaMessage = {
  role: string;
  content?: string;
  tool_calls?: ToolCall[];
};

type OllamaChatResponse = {
  message?: OllamaMessage;
};

const tools = [
  {
    type: "function",
    function: {
      name: "get_my_workflows",
      description:
        "Get workflows belonging to the authenticated user, including workflow IDs and step statuses.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_workflow_step",
      description:
        "Update the status of a workflow step owned by the authenticated user.",
      parameters: {
        type: "object",
        properties: {
          workflowId: {
            type: "string",
            description: "The workflow ID returned by get_my_workflows.",
          },
          stepOrder: {
            type: "integer",
            description: "The workflow step order number.",
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "in_progress",
              "completed",
            ],
          },
        },
        required: [
          "workflowId",
          "stepOrder",
          "status",
        ],
      },
    },
  },
];

const callOllama = async (
  messages: OllamaMessage[]
): Promise<OllamaChatResponse> => {
  const response = await fetch(
    "http://127.0.0.1:11434/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:4b",
        messages,
        tools,
        stream: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Ollama agent request failed: ${response.status}`
    );
  }

  return response.json() as Promise<OllamaChatResponse>;
};

export const runAgent = async (
  userId: string,
  userMessage: string
) => {
  const messages: OllamaMessage[] = [
    {
      role: "system",
      content:
        "You are the AI Bureaucracy Navigator agent. Use only the provided tools for workflow data and actions. Never access another user's workflows. If the user asks to change a workflow but does not provide a workflow ID, first use get_my_workflows to identify it, then call update_workflow_step. Continue using tools until the requested action is completed. Do not claim an action succeeded unless the update tool actually succeeded.",
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  const toolsUsed: string[] = [];

  for (let round = 0; round < 4; round++) {
    const data = await callOllama(messages);

    const assistantMessage = data.message;

    if (!assistantMessage) {
      throw new Error("Agent returned no message");
    }

    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls ?? [];

    if (toolCalls.length === 0) {
      return {
        answer:
          assistantMessage.content ||
          "The request was processed.",
        toolsUsed,
      };
    }

    for (const call of toolCalls) {
      const name = call.function.name;
      const args = call.function.arguments;

      let result: unknown;

      if (name === "get_my_workflows") {
        result = await getMyWorkflowsTool(userId);
      } else if (name === "update_workflow_step") {
        const workflowId = String(args.workflowId ?? "");
        const stepOrder = Number(args.stepOrder);
        const status = String(args.status);

        if (!workflowId) {
          throw new Error("workflowId is required");
        }

        if (!Number.isInteger(stepOrder)) {
          throw new Error("Invalid stepOrder");
        }

        if (
          ![
            "pending",
            "in_progress",
            "completed",
          ].includes(status)
        ) {
          throw new Error("Invalid status requested");
        }

        result = await updateWorkflowStepTool(
          userId,
          workflowId,
          stepOrder,
          status as
            | "pending"
            | "in_progress"
            | "completed"
        );
      } else {
        throw new Error(
          `Tool ${name} is not allowed`
        );
      }

      toolsUsed.push(name);

      messages.push({
        role: "tool",
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error(
    "Agent exceeded maximum tool-call rounds"
  );
};
