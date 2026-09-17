import mongoose, { Schema } from "mongoose";

export type WorkflowStepStatus =
  | "pending"
  | "in_progress"
  | "completed";

export interface WorkflowStep {
  order: number;
  title: string;
  description: string;
  status: WorkflowStepStatus;
  sourceChunkIndexes: number[];
}

export interface WorkflowDocument {
  ownerId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  status: "draft" | "active" | "completed";
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

const workflowStepSchema = new Schema<WorkflowStep>(
  {
    order: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    sourceChunkIndexes: {
      type: [Number],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const workflowSchema = new Schema<WorkflowDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },
    steps: {
      type: [workflowStepSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const WorkflowModel = mongoose.model<WorkflowDocument>(
  "Workflow",
  workflowSchema
);
