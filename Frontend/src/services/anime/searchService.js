import api from "../api";

export const searchDatabaseAnime  = async (keyword) => {

    const response = await api.get(
        `/anime/search?keyword=${keyword}`
    );

    return response.data;
};