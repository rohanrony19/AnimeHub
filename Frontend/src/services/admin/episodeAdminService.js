import api from "../api";

export const addEpisode = async (
    animeId,
    episodeData
) => {

    const response = await api.post(
        `/episodes/${animeId}`,
        episodeData
    );

    return response.data;
};

export const getAllEpisodes = async () => {
  const response = await api.get("/episodes");
  return response.data;
};

export const deleteEpisode = async (id) => {
  const response = await api.delete(`/episodes/${id}`);
  return response.data;
};

export const updateEpisode = async (id, episodeData) => {
  const response = await api.put(`/episodes/${id}`, episodeData);
  return response.data;
};