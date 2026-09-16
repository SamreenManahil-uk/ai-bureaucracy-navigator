import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  pageCount?: number;
  extractedText?: string;
  status: "uploaded" | "processing" | "processed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    pageCount: {
      type: Number,
    },

    extractedText: {
      type: String,
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "processed", "failed"],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model<IDocument>(
  "Document",
  documentSchema
);
