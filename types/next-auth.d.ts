import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "admin" | "seller";
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "seller";
  }
}
