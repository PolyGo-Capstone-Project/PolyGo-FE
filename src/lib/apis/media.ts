"use client";

import http from "@/lib/http";
import { UploadMediaResType } from "@/models";

type UploadImagePayload = {
  file: File | Blob;
  addUniqueName?: boolean;
  fileName?: string;
};

const prefix = "media/upload-file";

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
  if (addUniqueName !== undefined) {
    searchParams.set("addUniqueName", String(addUniqueName));
  }

  const url = `${prefix}${searchParams.size ? `?${searchParams}` : ""}`;

  return http.post<UploadMediaResType>(url, formData);
}

const mediaApiRequest = { uploadImage };

export type { UploadImagePayload };
export default mediaApiRequest;
