import type { DefaultSession } from "next-auth";
import type { Role } from "@/models/user";

// Teach Auth.js's types about the fields we add in the jwt/session callbacks (src/auth.config.ts).
declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

// In next-auth 5 beta the JWT type lives in @auth/core (next-auth/jwt only re-exports it).
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
