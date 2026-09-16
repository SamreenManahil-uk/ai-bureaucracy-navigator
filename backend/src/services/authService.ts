import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { UserModel, type UserDocument, type UserRole } from "../models/User";
import type { LoginInput, RegisterInput } from "../validators/authValidators";

const PASSWORD_SALT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

const toSafeUser = (user: UserDocument): SafeUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getJwtConfig = (): {
  secret: string;
  expiresIn: NonNullable<SignOptions["expiresIn"]>;
} => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret || !expiresIn) {
    throw new Error("JWT_SECRET and JWT_EXPIRES_IN must be configured");
  }

  return {
    secret,
    expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]>,
  };
};

const issueToken = (user: UserDocument): string => {
  const { secret, expiresIn } = getJwtConfig();

  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    secret,
    { expiresIn }
  );
};

export const registerUser = async (input: RegisterInput): Promise<SafeUser> => {
  const existingUser = await UserModel.exists({ email: input.email });

  if (existingUser) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return toSafeUser(user);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AuthError("An account with this email already exists", 409);
    }

    throw error;
  }
};

export const loginUser = async (
  input: LoginInput
): Promise<{ token: string; user: SafeUser }> => {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AuthError("Invalid email or password", 401);
  }

  return {
    token: issueToken(user),
    user: toSafeUser(user),
  };
};

export const getUserProfile = async (userId: string): Promise<SafeUser> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AuthError("Authenticated user no longer exists", 401);
  }

  return toSafeUser(user);
};

export const verifyToken = (token: string): AuthTokenPayload => {
  const { secret } = getJwtConfig();
  const decoded = jwt.verify(token, secret);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    (decoded.role !== "USER" && decoded.role !== "ADMIN")
  ) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  return decoded as AuthTokenPayload;
};
