import api from "../api";

export const searchAnimeMetadata = async (query) => {
  const response = await api.get("/admin/anime-metadata/search", {
    params: { query },
  });

  return response.data;
};

export const importAnimeMetadata = async ({
  provider,
  externalId,
}) => {
  const response = await api.post(
    "/admin/anime-metadata/import",
    {
      provider,
      externalId,
    },
  );

  return response.data;
};