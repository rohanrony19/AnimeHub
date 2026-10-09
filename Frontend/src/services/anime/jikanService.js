import axios from "axios";

const BASE_URL = import.meta.env.VITE_JIKAN_BASE_URL;
const ANILIST_BASE_URL = import.meta.env.VITE_ANILIST_BASE_URL;
const jikanPageCache = new Map();

const getCachedJikanPage = (cacheKey, request) => {
  if (!jikanPageCache.has(cacheKey)) {
    const pageRequest = request().catch((error) => {
      jikanPageCache.delete(cacheKey);
      throw error;
    });

    jikanPageCache.set(cacheKey, pageRequest);
  }

  return jikanPageCache.get(cacheKey);
};

const normalizeAniListAnime = (anime) => ({
  provider: "ANILIST",
  externalId: anime.id,
  mal_id: anime.idMal ?? null,

  title: anime.title?.english || anime.title?.romaji || "",

  synopsis: anime.description || "",

  score: anime.averageScore ? anime.averageScore / 10 : null,

  year: anime.startDate?.year ?? null,

  status: anime.status || "",

  images: {
    jpg: {
      large_image_url:
        anime.coverImage?.extraLarge || anime.coverImage?.large || "",
    },
  },

  genres: (anime.genres || []).map((genre) => ({
    name: genre,
  })),
});

export const getTopAnime = async () => {
  const jikanRequest = axios
    .get(`${BASE_URL}/top/anime`, {
      timeout: 3000,
    })
    .then((response) => {
      const data = response.data?.data ?? [];

      if (!data.length) {
        throw new Error("Jikan returned no anime");
      }

      return data;
    });

  const anilistRequest = axios
    .post(
      ANILIST_BASE_URL,
      {
        query: `
          query {
            Page(perPage: 25) {
              media(
                type: ANIME
                sort: SCORE_DESC
              ) {
                id
                idMal
                title {
                  romaji
                  english
                }
                description
                startDate {
                  year
                }
                averageScore
                status
                genres
                coverImage {
                  extraLarge
                  large
                }
              }
            }
          }
        `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      },
    )
    .then((response) => {
      const data = response.data?.data?.Page?.media ?? [];

      if (!data.length) {
        throw new Error("AniList returned no anime");
      }

      return data.map(normalizeAniListAnime);
    });

  try {
    return await Promise.any([jikanRequest, anilistRequest]);
  } catch (error) {
    console.error("Both Top Anime APIs failed:", error);
    return [];
  }
};

export const getJikanTopAnimePage = async (page = 1) => {
  const jikanRequest = axios
    .get(`${BASE_URL}/top/anime`, {
      params: {
        page,
        limit: 25,
      },
      timeout: 3000,
    })
    .then((response) => {
      const data = response.data?.data ?? [];

      if (!data.length) {
        throw new Error("Jikan returned no anime");
      }

      return {
        data,
        pagination: response.data.pagination,
      };
    });

  const anilistRequest = axios
    .post(
      ANILIST_BASE_URL,
      {
        query: `
          query ($page: Int!, $perPage: Int!) {
            Page(page: $page, perPage: $perPage) {
              pageInfo {
                currentPage
                lastPage
                hasNextPage
              }
              media(
                type: ANIME
                sort: SCORE_DESC
              ) {
                id
                idMal
                title {
                  romaji
                  english
                }
                description
                startDate {
                  year
                }
                averageScore
                status
                genres
                coverImage {
                  extraLarge
                  large
                }
              }
            }
          }
        `,
        variables: {
          page,
          perPage: 25,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      },
    )
    .then((response) => {
      const pageData = response.data?.data?.Page;
      const data = pageData?.media ?? [];

      if (!data.length) {
        throw new Error("AniList returned no anime");
      }

      return {
        data: data.map(normalizeAniListAnime),
        pagination: {
          last_visible_page: pageData.pageInfo.lastPage,
          has_next_page: pageData.pageInfo.hasNextPage,
        },
      };
    });

  return Promise.any([jikanRequest, anilistRequest]);
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
  const jikanRequest = axios
    .get(`${BASE_URL}/anime/${id}/full`, {
      timeout: 5000,
    })
    .then((response) => {
      const data = response.data?.data;

      if (!data) {
        throw new Error("Jikan returned no anime");
      }

      return data;
    });

  const anilistRequest = axios
    .post(
      ANILIST_BASE_URL,
      {
        query: `
          query ($malId: Int!) {
            Media(
              idMal: $malId
              type: ANIME
            ) {
              id
              idMal

              title {
                romaji
                english
              }

              description

              startDate {
                year
              }

              averageScore
              status
              genres

              coverImage {
                extraLarge
                large
              }

              trailer {
                id
                site
              }
            }
          }
        `,
        variables: {
          malId: Number(id),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 5000,
      },
    )
    .then((response) => {
      const anime = response.data?.data?.Media;

      if (!anime) {
        throw new Error("AniList returned no anime");
      }

      return {
        provider: "ANILIST",

        externalId: anime.id,

        mal_id: anime.idMal ?? Number(id),

        title: anime.title?.english || anime.title?.romaji || "",

        synopsis: anime.description || "",

        score: anime.averageScore ? anime.averageScore / 10 : null,

        year: anime.startDate?.year ?? null,

        status: anime.status || "",

        images: {
          jpg: {
            large_image_url:
              anime.coverImage?.extraLarge || anime.coverImage?.large || "",
          },
        },

        genres: (anime.genres || []).map((genre) => ({
          name: genre,
        })),

        trailer: anime.trailer
          ? {
              embed_url:
                anime.trailer.site === "youtube" && anime.trailer.id
                  ? `https://www.youtube.com/embed/${anime.trailer.id}`
                  : null,
            }
          : null,
      };
    });

  try {
    return await Promise.any([jikanRequest, anilistRequest]);
  } catch (error) {
    console.error("Both Jikan and AniList anime details failed:", error);

    throw error;
  }
};

export const getAnimeByTitle = async (title) => {
  const response = await axios.get(`${BASE_URL}/anime?q=${title}&limit=1`);

  return response.data.data[0];
};

export const getAnimeRecommendations = async (id) => {
  const response = await axios.get(`${BASE_URL}/anime/${id}/recommendations`);

  return response.data.data;
};

export const getAnimeReviews = async (id) => {
  const response = await axios.get(`${BASE_URL}/anime/${id}/reviews`);

  return response.data.data;
};

export const getAnimeCharacters = async (id) => {
  const response = await axios.get(`${BASE_URL}/anime/${id}/characters`);

  return response.data.data;
};

export const searchAnimeByTitle = async (title) => {
  const response = await axios.get(
    `${BASE_URL}/anime?q=${encodeURIComponent(title)}&limit=1`,
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
      timeout: 3000,
    });

    const jikanResults = response.data.data ?? [];

    if (jikanResults.length > 0) {
      return jikanResults;
    }
  } catch (error) {
    console.warn("Jikan unavailable. Using AniList fallback.");
  }

  try {
    const queryText = `
      query ($search: String!) {
        Page(perPage: 10) {
          media(search: $search, type: ANIME) {
              id
              idMal
              title {
                romaji
                english
              }
              description
              startDate {
                year
              }
              averageScore
              status
              genres
              coverImage {
                extraLarge
                large
            }
          }
        }
      }
    `;

    const response = await axios.post(
      ANILIST_BASE_URL,
      {
        query: queryText,
        variables: {
          search: query,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 5000,
      },
    );

    const anilistResults = response.data?.data?.Page?.media ?? [];

    return anilistResults.map(normalizeAniListAnime);
  } catch (error) {
    console.error("AniList Search Error:", error);
    return [];
  }
};

export const getJikanAnimeGenrePage = async (genreId, page = 1) => {
  return getCachedJikanPage(`genre-${genreId}-${page}`, async () => {
    const jikanRequest = axios
      .get(`${BASE_URL}/anime`, {
        params: {
          genres: genreId,
          page,
          limit: 25,
          order_by: "score",
          sort: "desc",
        },
        timeout: 3000,
      })
      .then((response) => {
        const data = response.data?.data ?? [];

        if (!data.length) {
          throw new Error("Jikan returned no anime");
        }

        return {
          data,
          pagination: response.data.pagination,
        };
      });

    const anilistRequest = axios
      .post(
        ANILIST_BASE_URL,
        {
          query: `
            query ($genreId: Int!, $page: Int!, $perPage: Int!) {
              Page(page: $page, perPage: $perPage) {
                pageInfo {
                  currentPage
                  lastPage
                  hasNextPage
                }
                media(
                  type: ANIME
                  genre_in: [$genreId]
                  sort: SCORE_DESC
                ) {
                  id
                  idMal
                  title {
                    romaji
                    english
                  }
                  description
                  startDate {
                    year
                  }
                  averageScore
                  status
                  genres
                  coverImage {
                    extraLarge
                    large
                  }
                }
              }
            }
          `,
          variables: {
            genreId,
            page,
            perPage: 25,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        },
      )
      .then((response) => {
        const pageData = response.data?.data?.Page;

        const data = pageData?.media ?? [];

        if (!data.length) {
          throw new Error("AniList returned no anime");
        }

        return {
          data: data.map(normalizeAniListAnime),
          pagination: {
            last_visible_page: pageData.pageInfo.lastPage,
            has_next_page: pageData.pageInfo.hasNextPage,
          },
        };
      });

    return Promise.any([jikanRequest, anilistRequest]);
  });
};
