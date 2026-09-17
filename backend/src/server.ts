import "dotenv/config";
import { createApp } from "./app";
import { connectDatabase } from "./config/db";

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  await connectDatabase();

  const app = await createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL available at http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
