import api from "../api";

export const uploadVideo = async (
  file,
  animeTitle,
  seasonNumber,
  episodeNumber
) => {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("animeTitle", animeTitle);
  formData.append("seasonNumber", seasonNumber);
  formData.append("episodeNumber", episodeNumber);

  const response = await api.post(
    "/upload/video",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
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

  return response.data.url;
};