"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { AppError } from "@/lib/api-response";
import { RegisterInput, SignInInput } from "@/schemas/auth";
import { registerStudent } from "@/services/user-service";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  values?: { name?: string; email?: string }; // echoed back so the form keeps them (never the password)
};

function firstErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: AuthFormState["fieldErrors"] = {};
  for (const i of issues) {
    const key = String(i.path[0]) as "name" | "email" | "password";
    out[key] ??= i.message;
  }
  return out;
}

// After sign-in we go to "/", and the proxy sends each role to its own dashboard.
const AFTER_SIGN_IN = "/";

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const parsed = SignInInput.safeParse(raw);
  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error.issues), values: { email: raw.email } };

  try {
    // On success this throws Next's redirect signal — it must NOT be caught here.
    await signIn("credentials", { ...parsed.data, redirectTo: AFTER_SIGN_IN });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password", values: { email: raw.email } };
    }
    throw error;
  }
  return {};
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const values = { name: raw.name, email: raw.email };
  const parsed = RegisterInput.safeParse(raw);
  if (!parsed.success) return { fieldErrors: firstErrors(parsed.error.issues), values };

  try {
    await registerStudent(parsed.data);
  } catch (error) {
    if (error instanceof AppError && error.code === "CONFLICT") {
      return { fieldErrors: { email: error.message }, values };
    }
    throw error;
  }

  try {
    await signIn("credentials", { email: parsed.data.email, password: parsed.data.password, redirectTo: AFTER_SIGN_IN });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but signing in failed. Please sign in.", values };
    }
    throw error;
  }
  return {};
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/sign-in" });
}
