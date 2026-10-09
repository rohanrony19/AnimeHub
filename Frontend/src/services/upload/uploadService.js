import api from "../api";

export const uploadVideo = async (
  file,
  animeTitle,
  seasonNumber,
  episodeNumber
) => {

  // 1. Initialize multipart upload
  const initResponse = await api.post(
    "/upload/video/multipart/init",
    null,
    {
      params: {
        animeTitle,
        seasonNumber,
        episodeNumber,
        originalFileName: file.name,
        contentType: file.type || "video/mp4",
        fileSize: file.size,
      },
    }
  );

  const {
    uploadId,
    key,
    videoUrl,
    partSize,
    totalParts,
    parts,
  } = initResponse.data;

  // 2. Upload each part directly to S3
  const uploadPart = async (part) => {

  const start =
    (part.partNumber - 1) * partSize;

  const end =
    Math.min(
      start + partSize,
      file.size
    );

  const chunk =
    file.slice(start, end);

  const uploadResponse =
    await fetch(
      part.url,
      {
        method: "PUT",
        body: chunk,
      }
    );

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload part ${part.partNumber}`
    );
  }

  const eTag =
    uploadResponse.headers.get("ETag");

  if (!eTag) {
    throw new Error(
      `ETag missing for part ${part.partNumber}`
    );
  }

  return {
    partNumber: part.partNumber,
    eTag,
  };
};

const completedParts = [];
const CONCURRENCY = 6;

for (let i = 0; i < parts.length; i += CONCURRENCY) {
  const batch = parts.slice(i, i + CONCURRENCY);

  const results = await Promise.all(
    batch.map(uploadPart)
  );

  completedParts.push(...results);
}

completedParts.sort(
  (a, b) =>
    a.partNumber - b.partNumber
);

const completeResponse = await api.post(
  "/upload/video/multipart/complete",
  completedParts,
  {
    params: {
  uploadId,
  key,
  animeTitle,
  seasonNumber,
  episodeNumber,
},
  }
);

return {
  url: completeResponse.data.url || videoUrl,
  thumbnailUrl: completeResponse.data.thumbnailUrl || null,
};
};

export const uploadImage = async (
  file,
  folder,
  fileName
) => {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("fileName", fileName);

  const response = await api.post(
    "/upload/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const uploadTrailer = async (file, animeTitle) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("animeTitle", animeTitle);

  const response = await api.post(
    "/upload/trailer",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};