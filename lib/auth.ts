import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getSellerByEmail } from "./sellers-persist";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "admin",
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
          return { id: "1", email, name: "Admin", role: "admin" as const };
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "seller",
      name: "Seller",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const inputEmail = credentials?.email?.trim().toLowerCase() ?? "";
        const inputPassword = (credentials?.password ?? "").trim();
        if (!inputEmail || !inputPassword) return null;
        const seller = await getSellerByEmail(inputEmail);
        if (!seller || seller.status !== "approved") return null;
        const ok = await compare(inputPassword, seller.passwordHash);
        if (!ok) return null;
        return { id: seller.id, email: seller.email, name: seller.name, role: "seller" as const };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "seller";
      }
      return session;
    },
  },
};
