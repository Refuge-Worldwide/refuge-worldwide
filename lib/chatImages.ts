import fs from "fs";
import { deleteFile, uploadFiles } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const chatImagesFolderId = process.env.DIRECTUS_CHAT_IMAGES_FOLDER_ID;

// The app and web chat shrink photos to ~100-300KB JPEGs before upload, so
// anything near this didn't come from them.
export const MAX_CHAT_IMAGE_BYTES = 1024 * 1024;

export function chatImagesEnabled(): boolean {
  return Boolean(chatImagesFolderId);
}

/**
 * Reads the upload and checks it's actually a JPEG (by its first bytes, not
 * the claimed type), so nothing else can be hosted on Directus through the
 * chat. Returns null otherwise.
 */
export async function readChatImage(path: string): Promise<Buffer | null> {
  const data = await fs.promises.readFile(path);
  if (data.length > MAX_CHAT_IMAGE_BYTES) return null;
  const isJpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  return isJpeg ? data : null;
}

// Uploads into the "Chat images" folder and returns its public asset url
export async function uploadChatImage(image: Buffer): Promise<string> {
  const form = new FormData();
  // Directus needs the folder field before the file
  form.append("folder", chatImagesFolderId as string);
  form.append(
    "file",
    new Blob([new Uint8Array(image)], { type: "image/jpeg" }),
    "chat.jpg"
  );

  const file = await directusServer.request(uploadFiles(form));
  return `${directusUrl}/assets/${file.id}`;
}

// Only removes images uploaded through the chat, not the show artwork
// that system messages link to on Contentful.
export async function deleteChatImage(url: string | null | undefined) {
  const prefix = `${directusUrl}/assets/`;
  if (!url?.startsWith(prefix)) return;
  const fileId = url.slice(prefix.length).split(/[?/]/)[0];
  await directusServer.request(deleteFile(fileId));
}
