import type { User } from "@auth/core/types";

interface Credentials {
  role: string;
  username: string;
  password: string;
}

export const authorizeFunction = async (credentials: Credentials) => {
  const loginBody = {
    role: credentials.role,
    username: credentials.username,
    password: credentials.password,
  };

  try {
    const loginURL = "http://localhost:4000/auth/login";

    const loginResponse = await fetch(loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });

    if (loginResponse.status !== 200) return null;

    const user = await loginResponse.json();

    console.log("user", user);

    return {
      id: user.username,
    } as User;
  } catch (err) {
    console.error("authorizeFunction error", err);
    return null;
  }
};