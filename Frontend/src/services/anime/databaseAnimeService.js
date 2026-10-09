import api from "../api";

const animeGenreCache = new Map();

export const getAllAnime = async () => {
  const response = await api.get("/anime");
  return response.data;
};

export const getDatabaseAnimeById = async (id) => {
  const response = await api.get(`/anime/${id}`);
  return response.data;
};

export const getDatabaseAnimeByMalId = async (malId) => {
  const response = await api.get(`/anime/mal/${malId}`);
  return response.data;
};

export const findOrCreateAnime = async (anime) => {
  const response = await api.post("/anime/find-or-create", anime);
  return response.data;
};

export const getDatabaseAnimeByGenre = async (
  genre,
  page = 0,
  size = 20,
) => {
  const cacheKey = `${genre}-${page}-${size}`;

  if (animeGenreCache.has(cacheKey)) {
    return animeGenreCache.get(cacheKey);
  }

  const response = await api.get("/anime/genre", {
    params: {
      genre,
      page,
      size,
    },
  });

  animeGenreCache.set(cacheKey, response.data);

  return response.data;
};