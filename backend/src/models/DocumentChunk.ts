import mongoose, { Schema } from "mongoose";

export interface IDocumentChunk {
  documentId: mongoose.Types.ObjectId;
  chunkIndex: number;
  text: string;
  startChar: number;
  endChar: number;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    startChar: {
      type: Number,
      required: true,
    },

    endChar: {
      type: Number,
      required: true,
    },

    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

documentChunkSchema.index(
  {
    documentId: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  }
);

export const DocumentChunkModel = mongoose.model<IDocumentChunk>(
  "DocumentChunk",
  documentChunkSchema
);
