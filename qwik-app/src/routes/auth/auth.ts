import type { User } from "@auth/core/types";

interface Credentials {
    username: 'string';
    password: 'string';
}

export const authorizeFunction = async (credentials: Credentials) => {
  const users = [
    {
      username: "123",
      password: "123",
    },
    {
      username: "OCamp",
      password: "OCamp",
    },
  ];

    console.log("credentials", credentials);
  const user = users.find(
    (user) =>
      user.username === credentials.username &&
      user.password === credentials.password
  );

  if (user) {
    return {
      id: user.username,
    } as User;
  } else {
    return null;
  }
};