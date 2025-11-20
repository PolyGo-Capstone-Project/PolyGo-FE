"use client";

import http from "@/lib/http";
import { UploadMediaResType, UploadMultipleMediaResType } from "@/models";

type UploadImagePayload = {
  file: File | Blob;
  addUniqueName?: boolean;
  fileName?: string;
};

type UploadImagesPayload = {
  files: (File | Blob)[];
  addUniqueName?: boolean;
};

type UploadFilePayload = {
  file: File | Blob;
  addUniqueName?: boolean;
  fileName?: string;
};

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

  const url = `media/upload-image${searchParams.size ? `?${searchParams}` : ""}`;

  return http.post<UploadMediaResType>(url, formData);
}

async function uploadImages({
  files,
  addUniqueName = true,
}: UploadImagesPayload) {
  const formData = new FormData();

  files.forEach((file, index) => {
    if (file instanceof File) {
      formData.append("files", file);
    } else {
      formData.append("files", file, `upload-${index}`);
    }
  });

  const searchParams = new URLSearchParams();
  if (addUniqueName !== undefined) {
    searchParams.set("addUniqueName", String(addUniqueName));
  }

  const url = `media/upload-images${searchParams.size ? `?${searchParams}` : ""}`;

  return http.post<UploadMultipleMediaResType>(url, formData);
}

async function uploadFile({
  file,
  addUniqueName = true,
  fileName,
}: UploadFilePayload) {
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

  const url = `media/upload-file${searchParams.size ? `?${searchParams}` : ""}`;

  return http.post<UploadMediaResType>(url, formData);
}

const mediaApiRequest = { uploadImage, uploadImages, uploadFile };

export type { UploadFilePayload, UploadImagePayload, UploadImagesPayload };
export default mediaApiRequest;
