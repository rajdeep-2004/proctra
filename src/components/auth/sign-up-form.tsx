"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthFormState } from "@/app/(auth)/actions";
import { Field } from "@/components/auth/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUpAction, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a student account</CardTitle>
        <CardDescription>Teachers: ask your administrator for an account.</CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="grid gap-4">
          {state.error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Field id="name" name="name" label="Full name" autoComplete="name" required
            defaultValue={state.values?.name} error={state.fieldErrors?.name} />
          <Field id="email" name="email" type="email" label="Email" autoComplete="email" required
            defaultValue={state.values?.email} error={state.fieldErrors?.email} />
          <Field id="password" name="password" type="password" label="Password" autoComplete="new-password" required
            minLength={8} error={state.fieldErrors?.password} />
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
