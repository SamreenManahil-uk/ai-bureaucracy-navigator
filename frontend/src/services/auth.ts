const API_BASE_URL = "http://localhost:5000/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

const safeJson = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Login failed"
    );
  }

  if (!data.token || !data.user) {
    throw new Error(
      "Invalid login response from server"
    );
  }

  return data as AuthResponse;
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Registration failed"
    );
  }

  /*
    Backend registration creates the user.
    We then sign in immediately so the
    frontend always receives a valid JWT.
  */
  return login(email, password);
};

export const saveAuth = (
  token: string,
  user: AuthUser
) => {
  localStorage.setItem(
    "authToken",
    token
  );

  localStorage.setItem(
    "authUser",
    JSON.stringify(user)
  );
};

export const logout = () => {
  localStorage.removeItem(
    "authToken"
  );

  localStorage.removeItem(
    "authUser"
  );
};

export const getStoredUser =
  (): AuthUser | null => {
    const stored =
      localStorage.getItem(
        "authUser"
      );

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(
        stored
      ) as AuthUser;
    } catch {
      return null;
    }
  };
