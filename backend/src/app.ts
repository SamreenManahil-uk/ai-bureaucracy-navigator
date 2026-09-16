import express from "express";
import cors from "cors";
import documentRoutes from "./routes/documentRoutes";
import authRoutes from "./routes/authRoutes";
import ragRoutes from "./routes/ragRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AI Bureaucracy Navigator API",
  });
});

app.use("/api/documents", documentRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/auth", authRoutes);

export default app;
