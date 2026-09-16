import type { Request, Response } from "express";
import {
  AuthError,
  getUserProfile,
  loginUser,
  registerUser,
} from "../services/authService";
import type { LoginInput, RegisterInput } from "../validators/authValidators";

const handleAuthError = (error: unknown, res: Response): Response => {
  if (error instanceof AuthError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Authentication error:", error);
  return res.status(500).json({ message: "Authentication request failed" });
};

export const register = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body as RegisterInput);
    return res.status(201).json({ user });
  } catch (error) {
    return handleAuthError(error, res);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body as LoginInput);
    return res.status(200).json(result);
  } catch (error) {
    return handleAuthError(error, res);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await getUserProfile(req.auth.userId);
    return res.status(200).json({ user });
  } catch (error) {
    return handleAuthError(error, res);
  }
};
