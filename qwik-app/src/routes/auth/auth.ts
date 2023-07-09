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
    const loginURL = "http://localhost:3500/auth/login";

    const loginResponse = await fetch(loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });

    if (loginResponse.status !== 200) return null;

    const user = await loginResponse.json();

    return {
      id: user.id,
      role: user.role,
      access_token: user.token,
    };
  } catch (err) {
    return null;
  }
};
