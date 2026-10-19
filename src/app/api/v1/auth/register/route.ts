import { created, readJson, withHandler } from "@/lib/api-response";
import { RegisterInput } from "@/schemas/auth";
import { registerStudent } from "@/services/user-service";

// POST /api/v1/auth/register — student self-registration. Public. Any "role" in the body is ignored.
export const POST = withHandler(async (req) => {
  const input = RegisterInput.parse(await readJson(req));
  return created(await registerStudent(input));
});
