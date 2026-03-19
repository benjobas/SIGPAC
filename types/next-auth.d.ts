import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      rol?: string;
      sede?: string;
    } & DefaultSession["user"];
  }
}
