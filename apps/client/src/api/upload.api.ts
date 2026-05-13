import axiosInstance from "./axiosInstance";

export const getPresignedDownloadUrls = async (keys: string | string[]) => {
  const response = await axiosInstance.post("/uploads/presign-download-url", {
    keys,
  });

  if (Array.isArray(keys)) {
    return response.data.urls as string[];
  } else {
    return response.data.url as string;
  }
};

export const uploadFileToStorage = async ({
  file,
  folderKey,
  onUploadProgress,
}: {
  file: File;
  folderKey?: string;
  onUploadProgress?: (progress: number) => void;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folderKey) {
    formData.append("folder", folderKey);
  }

  const response = await axiosInstance.post("/uploads/file", formData, {
    onUploadProgress: (event) => {
      if (event.total && onUploadProgress) {
        onUploadProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return response.data as { publicUrl: string; key: string; bucket: string };
};
