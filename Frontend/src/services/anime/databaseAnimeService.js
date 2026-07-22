import { AArrowDown } from "lucide-react";
import api from "../api";

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
  size = 20
) => {
  const response = await api.get("/anime/genre", {
    params: {
      genre,
      page,
      size,
    },
  });

  return response.data;
};
