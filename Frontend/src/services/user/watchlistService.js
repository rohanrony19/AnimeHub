import api from "../api";

export const getWatchlist = async () => {
    const response = await api.get("/watchlist");
    return response.data;
};

export const addWatchlist = async (anime) => {
    const response = await api.post("/watchlist", anime);
    return response.data;
};

export const addWatchlistByAnimeId = async (animeId) => {
    const response = await api.post(`/watchlist/anime/${animeId}`);
    return response.data;
};

export const removeWatchlist = async (animeId) => {
    const response = await api.delete(`/watchlist/${animeId}`);
    return response.data;
};

export const removeWatchlistByAnimeId = async (animeId) => {
    const response = await api.delete(`/watchlist/anime/${animeId}`);
    return response.data;
};

export const getWatchlistStatus = async (animeId) => {
    const response = await api.get(`/watchlist/${animeId}`);
    return response.data;
};