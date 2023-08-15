interface Credentials {
  role?: string;
  username: string;
  password?: string;
}

export const googleLogin = async (credentials: Credentials) => {
  const loginBody = {
    username: credentials.username,
    passkey: process.env.CROSS_SECRET,
  };

  try {
    const loginResponse = await fetch(
      `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/auth/google-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginBody),
      },
    );


    if (loginResponse.status !== 200 && loginResponse.status !== 201)
      return null;

    const user = await loginResponse.json();
    return {
      id: user.id,
      role: user.role,
      access_token: user.token,
    };
  } catch (err) {
    console.error("Error in googleLogin: ", err);
    return null;
  }
};

export const authorizeFunction = async (credentials: Credentials) => {
  const loginBody = {
    role: credentials.role,
    username: credentials.username,
    password: credentials.password,
  };

  try {
    const loginResponse =
      loginBody.role === "changeRole" || loginBody.role === "refreshToken"
        ? await fetch(
            `${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/auth/protected-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${loginBody.password}`,
              },
              body: JSON.stringify(loginBody),
            },
          )
        : await fetch(`${process.env.SERVER_ADDRESS}:${process.env.BACKEND_PORT}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginBody),
          });

    if (loginResponse.status !== 200 && loginResponse.status !== 201)
      return null;

    const user = await loginResponse.json();

    console.log("user: ", user);

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
