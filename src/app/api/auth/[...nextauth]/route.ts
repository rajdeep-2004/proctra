// Auth.js endpoints: /api/auth/callback/credentials, /api/auth/session, /api/auth/signout, /api/auth/csrf …
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
