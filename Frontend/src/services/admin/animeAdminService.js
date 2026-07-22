import api from "../api";

export const addAnime = async (animeData) => {

    const response = await api.post(
        "/anime",
        animeData
    );

    return response.data;
};

export const getAllAnime = async () => {
  const response = await api.get("/anime");
  return response.data;
};

export const deleteAnime = async (id) => {
  const response = await api.delete(`/anime/${id}`);
  return response.data;
};

export const updateAnime = async (id, animeData) => {
  const response = await api.put(`/anime/${id}`, animeData);
  return response.data;
};