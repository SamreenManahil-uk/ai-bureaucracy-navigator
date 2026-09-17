import { ApolloServer } from "@apollo/server";
import jwt from "jsonwebtoken";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

type JwtPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

export const createApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  return server;
};

export const buildGraphQLContext = (
  authorizationHeader?: string
) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return {};
  }

  const token = authorizationHeader.substring(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return {};
  }
};
