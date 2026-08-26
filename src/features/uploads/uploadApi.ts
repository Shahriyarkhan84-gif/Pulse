import { endpoints } from "@/services/api/endpoints";

/**
 * Uploads a locally-picked file straight to R2 via a presigned URL — the
 * file bytes never pass through our backend.
 */
export async function uploadImage(kind: "avatar" | "thumbnail", fileUri: string): Promise<string> {
  const contentType = "image/jpeg";
  const {
    data: { uploadUrl, publicUrl },
  } = await endpoints.uploads.presign(kind, contentType);

  const fileResponse = await fetch(fileUri);
  const blob = await fileResponse.blob();

  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  return publicUrl;
}
