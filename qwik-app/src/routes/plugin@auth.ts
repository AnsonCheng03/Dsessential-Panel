import { serverAuth$ } from "@builder.io/qwik-auth";
import Credentials from "@auth/core/providers/credentials";
import type { Provider } from "@auth/core/providers";
import type { User } from "@auth/core/types";

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(({ env }) => ({
    secret: env.get("AUTH_SECRET"),
    trustHost: true,
    providers: [
      Credentials({
        credentials: {
          username: { label: "Username" },
          password: { label: "Password", type: "password" },
        },
        async authorize(
          credentials: Partial<Record<"username" | "password", unknown>>
        ): Promise<User | null> {
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
        },
      }),
    ] as Provider[],
  }));