import { serverAuth$ } from "@builder.io/qwik-auth";
import Credentials from "@auth/core/providers/credentials";
import type { Provider } from "@auth/core/providers";
import { authorizeFunction } from "./auth/auth";

interface Credentials {
  role: string;
  username: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(({ env }) => ({
    secret: env.get("AUTH_SECRET"),
    trustHost: true,
    providers: [
      Credentials({
        credentials: {
          role: { label: "Role", type: "select", options: ["admin", "user"] },
          username: { label: "Username" },
          password: { label: "Password", type: "password" },
        },
        async authorize(
          credentials: Partial<Record<"username" | "password", unknown>>
        ): Promise<User | null> {
          const user = await authorizeFunction(credentials as Credentials);
          if (!user) return null;
          return {
            id: user.id,
            name: user.role,
            email: user.access_token,
          };
        },
      }),
    ] as Provider[],
    pages: {
      signIn: "/Dsessential/auth/",
      error: "/Dsessential/auth/",
    },
  }));
