import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { z } from "zod";
import { AppError } from "@/lib/api-response";

// Validated separately from env() on purpose: missing/wrong Cloudinary keys should only break snapshot
// uploads (logged as snapshot_failed), not the whole app.
const CloudinaryEnv = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1).refine((v) => !v.startsWith("<"), "placeholder"),
  CLOUDINARY_API_KEY: z.string().min(1).refine((v) => !v.startsWith("<"), "placeholder"),
  CLOUDINARY_API_SECRET: z.string().min(1).refine((v) => !v.startsWith("<"), "placeholder"),
});

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const parsed = CloudinaryEnv.safeParse(process.env);
  if (!parsed.success) {
    console.error(`[cloudinary] not configured: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`); // names only
    throw new AppError("UPSTREAM_FAILED", "Snapshot storage isn't configured", 502);
  }
  cloudinary.config({
    cloud_name: parsed.data.CLOUDINARY_CLOUD_NAME,
    api_key: parsed.data.CLOUDINARY_API_KEY,
    api_secret: parsed.data.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

/**
 * Uploads one JPEG as an `authenticated` (private) asset: there is no public URL; viewing needs a URL signed
 * by our server (D-008). Folder: proctra/<quizId>/<attemptId>.
 */
export async function uploadPrivateJpeg(bytes: Buffer, folder: string): Promise<string> {
  ensureConfigured();
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { type: "authenticated", resource_type: "image", folder, format: "jpg", timeout: 15_000 },
        (error, res) => (error || !res ? reject(error ?? new Error("empty response")) : resolve(res)),
      );
      stream.end(bytes);
    });
    return result.public_id;
  } catch (error) {
    // Cloudinary's SDK rejects with plain { message, http_code } objects, not Error instances.
    const e = error as { message?: string; http_code?: number } | undefined;
    console.error(`[cloudinary] upload failed: ${e?.http_code ?? "?"} ${e?.message ?? String(error)}`);
    throw new AppError("UPSTREAM_FAILED", "Couldn't store the snapshot", 502);
  }
}

/** Short-lived signed URL for an authenticated image (teacher gallery, S-01). */
export function signedImageUrl(publicId: string, expiresInSeconds = 600): string {
  ensureConfigured();
  return cloudinary.utils.private_download_url(publicId, "jpg", {
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
}
