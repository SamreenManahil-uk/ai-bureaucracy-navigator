import express from "express";
import cors from "cors";
import { expressMiddleware } from "@as-integrations/express5";

import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import ragRoutes from "./routes/ragRoutes";
import workflowRoutes from "./routes/workflowRoutes";
import agentRoutes from "./routes/agentRoutes";
import adminRoutes from "./routes/adminRoutes";

import {
  buildGraphQLContext,
  createApolloServer,
} from "./graphql/apolloServer";
import activityRoutes from "./routes/activityRoutes";

import documentDeleteRoutes from "./routes/documentDeleteRoutes";
export const createApp = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "AI Bureaucracy Navigator API",
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/documents", documentDeleteRoutes);
  app.use("/api/rag", ragRoutes);
  app.use("/api/workflows", workflowRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/admin", adminRoutes);
  app.use("/api/history", activityRoutes);

  const apolloServer = await createApolloServer();

  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req }) =>
        buildGraphQLContext(req.headers.authorization),
    })
  );

  return app;
};
