import api from "../api";

export const getContinueWatching = async () => {
    const response = await api.get("/continue-watching");
    return response.data;
};

export const saveContinueWatching = async (episodeId) => {

    const response = await api.post(
        `/continue-watching/${episodeId}`
    );

    return response.data;
};

export const removeContinueWatching = async (episodeId) => {
  const response = await api.delete(
    `/continue-watching/${episodeId}`
  );

  return response.data;
};