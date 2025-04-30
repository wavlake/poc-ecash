"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "../hooks/usePlayer";
import MusicPlayer from "../components/MusicPlayer";
import TrackList from "../components/TrackList";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const {
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
  } = usePlayer();

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  // Update current track index when tracks or currentTrack change
  useEffect(() => {
    if (tracks.length > 0 && currentTrack) {
      const index = tracks.findIndex((track) => track.id === currentTrack.id);
      if (index !== -1) {
        setCurrentTrackIndex(index);
      }
    }
  }, [tracks, currentTrack]);

  const handleTrackSelect = (index: number) => {
    playTrack(index);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Wavlake Music Player
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left sidebar for music player */}
          <div className="md:col-span-1">
            {currentTrack && (
              <MusicPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlay={() => togglePlay()}
                onPause={() => togglePlay()}
                onNext={nextTrack}
                onPrevious={previousTrack}
              />
            )}
          </div>

          {/* Main content area for track list */}
          <div className="md:col-span-2">
            <SearchBar onSearch={searchTracks} />

            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}

            <h2 className="text-xl font-semibold mb-4">
              {isLoading ? "Loading tracks..." : "Tracks"}
            </h2>

            <TrackList
              tracks={tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-gray-400">
        <p>Powered by Next.js and Wavlake API</p>
      </footer>
    </div>
  );
}
