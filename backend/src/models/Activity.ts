import {
  Schema,
  model,
  Types,
} from "mongoose";

export type ActivityType =
  | "document_upload"
  | "workflow_generated"
  | "workflow_step_updated"
  | "rag_question"
  | "agent_action";

export interface ActivityRecord {
  ownerId: Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const activitySchema =
  new Schema<ActivityRecord>(
    {
      ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        required: true,
        enum: [
          "document_upload",
          "workflow_generated",
          "workflow_step_updated",
          "rag_question",
          "agent_action",
        ],
        index: true,
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

      metadata: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

activitySchema.index({
  ownerId: 1,
  createdAt: -1,
});

export const ActivityModel =
  model<ActivityRecord>(
    "Activity",
    activitySchema
  );
