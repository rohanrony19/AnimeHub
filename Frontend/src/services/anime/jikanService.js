import axios from "axios";

const BASE_URL = "https://api.jikan.moe/v4";

export const getTopAnime = async () => {
  const response = await axios.get(`${BASE_URL}/top/anime`);
  return response.data.data;
};

export const getJikanAnimeByGenre = async (genreId, page = 1) => {
  try {

    const response = await axios.get(`${BASE_URL}/anime`, {
      params: {
        genres: genreId,
        page,
        limit: 24,
        order_by: "score",
        sort: "desc",
      },
      timeout: 10000,
    });


    return response.data.data ?? [];
  } catch (error) {
    // console.log("Jikan Error:", error.response?.status, error.response?.data);

    return [];
  }
};

export const searchAnime = async (query) => {
  if (!query.trim()) return [];

  try {
    const response = await axios.get(`${BASE_URL}/anime`, {
      params: {
        q: query,
        limit: 10,
      },
      timeout: 10000,
    });

    return response.data.data ?? [];
  } catch (error) {
    // If /anime search fails, try the search endpoint
    try {
      const fallback = await axios.get(`${BASE_URL}/anime`, {
        params: {
          q: query,
          limit: 10,
          order_by: "score",
          sort: "desc",
        },
        timeout: 10000,
      });

      return fallback.data.data ?? [];
    } catch {
      return [];
    }
  }
};

export const getAnimeById = async (id) => {
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/anime/${id}/full`
    );

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 504) {
      const response = await axios.get(
        `https://api.jikan.moe/v4/anime/${id}`
      );

      return response.data.data;
    }

    throw error;
  }
};

export const getAnimeByTitle = async (title) => {
  const response = await axios.get(
    `${BASE_URL}/anime?q=${title}&limit=1`
  );

  return response.data.data[0];
};

export const getAnimeEpisodes = async (id, page = 1) => {
  const response = await axios.get(
    `${BASE_URL}/anime/${id}/episodes?page=${page}`
  );

  return response.data.data;
};

export const getAnimeSeasons = async (animeId) => {
  const response = await axios.get(
    `${BASE_URL}/anime/${animeId}/videos/episodes`
  );

  return response.data.data;
};

export const getAnimeRecommendations = async (id) => {
  const response = await axios.get(
    `${BASE_URL}/anime/${id}/recommendations`
  );

  return response.data.data;
};

export const getAnimeReviews = async (id) => {
  const response = await axios.get(
    `${BASE_URL}/anime/${id}/reviews`
  );

  return response.data.data;
};

export const getAnimeCharacters = async (id) => {
  const response = await axios.get(
    `${BASE_URL}/anime/${id}/characters`
  );

  return response.data.data;
};

export const getAllHeroBanners = async () => {
  const response = await api.get("/herobanners");
  return response.data;
};

export const getAnimeRelations = async (id) => {
  const response = await axios.get(
    `https://api.jikan.moe/v4/anime/${id}/relations`
  );

  return response.data.data;
};

export const searchAnimeByTitle = async (title) => {
  const response = await axios.get(
    `${BASE_URL}/anime?q=${encodeURIComponent(title)}&limit=1`
  );

  return response.data.data[0];
};

export const searchAnimeList = async (query) => {
  if (!query.trim()) return [];

  try {
    const response = await axios.get(`${BASE_URL}/anime`, {
      params: {
        q: query,
        limit: 10,
      },
      timeout: 10000,
    });

    return response.data.data ?? [];
  } catch (error) {
    // console.log("Jikan Search Failed:", error.response?.status);

    return [];
  }
};