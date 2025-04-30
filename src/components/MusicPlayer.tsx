"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Track } from "../types/wavlake";

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current) {
      // Reset the audio element when the track changes
      audioRef.current.currentTime = 0;
      setCurrentTime(0);

      // If isPlaying is true, attempt to play the new track
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Play error:", error);
            onPause(); // Notify parent that playback failed
          });
        }
      }
    }
  }, [currentTrack, onPause]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Play error:", error);
          onPause(); // Notify parent that playback failed
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, onPause]);

  // Update time display
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle duration change
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle track completion
  const handleEnded = () => {
    onNext();
  };

  // Format time display (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  if (!currentTrack) {
    return <div className="p-4 text-center">No track selected</div>;
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Album artwork */}
      <div className="relative w-64 h-64 mb-4">
        <Image
          src={
            currentTrack.albumArtUrl ||
            currentTrack.artistArtUrl ||
            "/placeholder-album.png"
          }
          alt={`${currentTrack.title} artwork`}
          fill
          sizes="(max-width: 768px) 100vw, 256px"
          priority
          style={{ objectFit: "cover" }}
          className="rounded-md"
        />
      </div>

      {/* Track info */}
      <div className="w-full text-center mb-4">
        <h2 className="text-xl font-bold truncate">{currentTrack.title}</h2>
        <p className="text-gray-400 truncate">{currentTrack.artist}</p>
        <p className="text-gray-500 text-sm truncate">
          {currentTrack.albumTitle}
        </p>
      </div>

      {/* Audio element (hidden) */}
      <audio
        ref={audioRef}
        src={currentTrack.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Custom player controls */}
      <div className="w-full">
        {/* Seek bar */}
        <div className="flex items-center mb-2">
          <span className="text-xs text-gray-400 mr-2">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 ml-2">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback controls */}
        <div className="flex justify-center items-center space-x-6">
          <button
            onClick={onPrevious}
            className="text-white p-2 rounded-full focus:outline-none hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="bg-blue-600 text-white p-3 rounded-full focus:outline-none hover:bg-blue-700"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={onNext}
            className="text-white p-2 rounded-full focus:outline-none hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
