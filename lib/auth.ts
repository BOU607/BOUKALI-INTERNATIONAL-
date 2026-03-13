import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = process.env.ADMIN_EMAIL?.trim();
        const password = process.env.ADMIN_PASSWORD?.trim();
        if (!email || !password) return null;
        const inputEmail = credentials?.email?.trim().toLowerCase() ?? "";
        const inputPassword = (credentials?.password ?? "").trim();
        if (inputEmail === email.trim().toLowerCase() && inputPassword === password) {
          return { id: "1", email, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
