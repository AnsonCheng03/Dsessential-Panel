import { serverAuth$ } from "@builder.io/qwik-auth";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import type { Provider } from "@auth/core/providers";
import { authorizeFunction, googleLogin } from "./auth/auth";

interface Credentials {
  role: string;
  username: string;
  password?: string;
}

interface User {
  id: string;
  role: string;
  username: string;
  access_token?: string;
}

let tmp_access_token: null | string = null;

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
          credentials: Partial<Record<"username" | "password", unknown>>,
        ): Promise<User | null> {
          const user = await authorizeFunction(credentials as Credentials);
          if (!user) return null;
          tmp_access_token = user.access_token;
          return {
            id: user.id as string,
            role: user.role as string,
            username: user.id as string,
          };
        },
      }),
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
          },
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
          if (
            profile?.email_verified &&
            (profile?.email?.endsWith("@dsessential.com") ||
              profile?.email?.endsWith("@hkdsessential.com") ||
              profile?.email?.endsWith("@bigappletutorial.com"))
          ) {
            const token = await googleLogin({
              username: profile.email,
            });
            if (!token) return false;
            tmp_access_token = token.access_token;
            return true;
          }
          return false;
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token.accessToken = tmp_access_token;
          token.user = user;
          tmp_access_token = null;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session as any).accessToken = token.accessToken;
          if (token.user) (session as any).user = token.user;
        }
        return session;
      },
    },
    pages: {
      error: "/Dsessential/auth/",
      signIn: "/Dsessential/auth/",
    },
  }));
