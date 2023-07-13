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
    const loginResponse =
      loginBody.role === "changeRole"
        ? await fetch(
            `${process.env.BACKEND_ADDRESS}:3500/auth/protected-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${loginBody.password}`,
              },
              body: JSON.stringify(loginBody),
            }
          )
        : await fetch(`${process.env.BACKEND_ADDRESS}:3500/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginBody),
          });

    if (loginResponse.status !== 200 && loginResponse.status !== 201)
      return null;

    const user = await loginResponse.json();

    return {
      id: user.id,
      role: user.role,
      access_token: user.token,
    };
  } catch (err) {
    console.error("Error in authorizeFunction: ", err);
    return null;
  }
};
