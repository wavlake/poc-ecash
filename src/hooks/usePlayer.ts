"use client";

import { useState, useEffect, useCallback } from "react";
import { Track } from "../types/wavlake";
import { wavlakeApi } from "../services/wavlakeApi";

export const usePlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentTrack =
    tracks.length > 0 && currentTrackIndex < tracks.length
      ? tracks[currentTrackIndex]
      : undefined;

  // Fetch initial tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        setIsPlaying(false); // Ensure playback is stopped when loading new tracks
        const trendingTracks = await wavlakeApi.getTrendingTracks();
        setTracks(trendingTracks);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError("Failed to load tracks. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  // Play a specific track by index
  const playTrack = useCallback(
    (index: number) => {
      if (index >= 0 && index < tracks.length) {
        // First pause, then change track, then play
        setIsPlaying(false);
        setCurrentTrackIndex(index);
        // Add a slight delay to ensure the audio element has time to update
        setTimeout(() => {
          setIsPlaying(true);
        }, 50);
      }
    },
    [tracks.length]
  );

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Next track
  const nextTrack = useCallback(() => {
    if (currentTrackIndex < tracks.length - 1) {
      playTrack(currentTrackIndex + 1);
    } else {
      // Loop back to the first track
      playTrack(0);
    }
  }, [currentTrackIndex, tracks.length, playTrack]);

  // Previous track
  const previousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1);
    } else {
      // Loop to the last track
      playTrack(tracks.length - 1);
    }
  }, [currentTrackIndex, tracks.length, playTrack]);

  // Search tracks
  const searchTracks = async (query: string) => {
    try {
      setIsLoading(true);
      setIsPlaying(false); // Stop playback while loading search results

      let results;
      if (!query.trim()) {
        // If query is empty, fetch trending tracks
        results = await wavlakeApi.getTrendingTracks();
      } else {
        results = await wavlakeApi.searchTracks(query);
      }

      setTracks(results);
      setCurrentTrackIndex(0);
      setIsLoading(false);
    } catch (err) {
      console.error("Error searching tracks:", err);
      setError("Failed to search tracks. Please try again later.");
      setIsLoading(false);
    }
  };

  return {
    tracks,
    currentTrack,
    isPlaying,
    isLoading,
    error,
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    searchTracks,
  };
};
