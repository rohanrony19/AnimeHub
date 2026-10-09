import api from "../api";

export const getFavorites = async () => {
    const response = await api.get("/favorites");
    return response.data;
};

export const addFavorite = async (anime) => {
    const response = await api.post("/favorites", anime);
    return response.data;
};

export const addFavoriteByAnimeId = async (animeId) => {
    const response = await api.post(`/favorites/anime/${animeId}`);
    return response.data;
};

export const removeFavorite = async (animeId) => {
    const response = await api.delete(`/favorites/${animeId}`);
    return response.data;
};

export const removeFavoriteByAnimeId = async (animeId) => {
    const response = await api.delete(`/favorites/anime/${animeId}`);
    return response.data;
};

export const getFavoriteStatus = async (animeId) => {
    const response = await api.get(`/favorites/${animeId}`);
    return response.data;
};