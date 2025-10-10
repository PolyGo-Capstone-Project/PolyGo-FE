"use client";

import envConfig from "@/config";
import { UploadMediaResType } from "@/models";

type UploadImagePayload = {
  file: File | Blob;
  addUniqueName?: boolean;
  fileName?: string;
};

const prefix = "/dev/upload-image";
const isBrowser = typeof window !== "undefined";

const getSessionToken = () =>
  isBrowser ? window.localStorage.getItem("sessionToken") : null;

const normalizePath = (path: string) =>
  path.startsWith("/") ? path.slice(1) : path;

async function uploadImage({
  file,
  addUniqueName = true,
  fileName,
}: UploadImagePayload) {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file);
  } else {
    formData.append("file", file, fileName ?? "upload");
  }

  const searchParams = new URLSearchParams();
  if (typeof addUniqueName !== "undefined") {
    searchParams.set("addUniqueName", String(addUniqueName));
  }

  const query = searchParams.toString();
  const endpoint = envConfig.NEXT_PUBLIC_API_ENDPOINT.replace(/\/+$/, "");
  const fullPath = normalizePath(prefix);
  const url = `${endpoint}/${fullPath}${query ? `?${query}` : ""}`;

  const headers: Record<string, string> = {};
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });

  const payload: UploadMediaResType = await response.json();

  return {
    status: response.status,
    payload,
  };
}

const mediaApiRequest = {
  uploadImage,
};

export type { UploadImagePayload };
export default mediaApiRequest;
