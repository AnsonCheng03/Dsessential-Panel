import { serverAuth$ } from "@builder.io/qwik-auth";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import type { Provider } from "@auth/core/providers";
import { authorizeFunction } from "./auth/auth";

interface Credentials {
  role: string;
  username: string;
  password: string;
}

interface User {
  id: string;
  role: string;
  username: string;
  access_token?: string;
}

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(({ env }) => ({
    secret: env.get("AUTH_SECRET"),
    trustHost: true,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
          },
        },
      }),
      Credentials({
        credentials: {
          role: { label: "Role", type: "select", options: ["admin", "user"] },
          username: { label: "Username" },
          password: { label: "Password", type: "password" },
        },
        async authorize(
          credentials: Partial<Record<"username" | "password", unknown>>,
        ): Promise<User | null> {
          const user = await authorizeFunction(credentials as Credentials);
          if (!user) return null;
          return {
            id: user.id as string,
            role: user.role as string,
            username: user.id as string,
            access_token: user.access_token as string,
          };
        },
      }),
    ] as Provider[],
    session: {
      strategy: "jwt",
      maxAge: 60 * 60 * 8, // seconds
    },
    callbacks: {
      async signIn({ account, profile }) {
        if (account && account.provider === "google") {
          console.log("Google account", profile);
          if (
            profile?.email_verified &&
            (profile?.email?.endsWith("@dsessential.com") ||
              profile?.email?.endsWith("@hkdsessential.com")||
              profile?.email?.endsWith("@bigappletutorial.com"))
          ) {
            return true;
          }
          return false;
        }
        return true; // Do different verification for other providers that don't have `email_verified`
      },
      async jwt({ token, user }) {
        if (user) {
          token.accessToken = (user as User).access_token;
          token.user = user;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session as any).accessToken = token.accessToken;
          (token.user as User).access_token = undefined;
          (session as any).user = token.user;
          token.user = undefined;
        }
        return session;
      },
    },
    pages: {
      error: "/Dsessential/auth/",
    },
  }));
