// services/wavlakeApi.ts
import axios from "axios";
import { Track, Artist, Album } from "../types/wavlake";

const API_BASE_URL = "https://wavlake.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const wavlakeApi = {
  // Get trending tracks
  getTrendingTracks: async (): Promise<Track[]> => {
    const response = await api.get(
      "/content/rankings?sort=sats&days=21&limit=10"
    );
    return response.data;
  },

  // Get track by ID
  getTrack: async (id: string): Promise<Track> => {
    const response = await api.get(`/content/tracks/${id}`);
    return response.data;
  },

  // Search tracks
  searchTracks: async (query: string): Promise<Track[]> => {
    const response = await api.get(`/content/search?term=${query}`);
    return response.data;
  },
};
