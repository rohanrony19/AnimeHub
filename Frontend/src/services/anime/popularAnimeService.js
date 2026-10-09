import { getDatabaseAnimeByGenre } from "./databaseAnimeService";

export const getPopularAnime = async (page = 0, size = 20) => {
  return getDatabaseAnimeByGenre("POPULAR", page, size);
};