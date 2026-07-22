import api from "../api";

export const getFavorites = async () => {
    const response = await api.get("/favorites");
    return response.data;
};

export const addFavorite = async (anime) => {
    const response = await api.post("/favorites", anime);
    return response.data;
};

export const removeFavorite = async (animeId) => {
    const response = await api.delete(`/favorites/${animeId}`);
    return response.data;
};