"use client";

import React from "react";
import Image from "next/image";
import { Track } from "../types/wavlake";

interface TrackListProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
  isLoading: boolean;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrackIndex,
  onTrackSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center p-4">
        No tracks found. Try another search.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-700">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={`flex items-center p-3 hover:bg-gray-800 cursor-pointer ${
            index === currentTrackIndex ? "bg-gray-800" : ""
          }`}
          onClick={() => onTrackSelect(index)}
        >
          <div className="relative h-12 w-12 flex-shrink-0 mr-3">
            <Image
              src={
                track.albumArtUrl ||
                track.artistArtUrl ||
                "/placeholder-album.png"
              }
              alt={`${track.title} artwork`}
              fill
              sizes="48px"
              style={{ objectFit: "cover" }}
              className="rounded"
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-white text-sm font-medium truncate">
              {track.title}
            </h3>
            <p className="text-gray-400 text-xs truncate">{track.artist}</p>
            <p className="text-gray-500 text-xs truncate">{track.albumTitle}</p>
          </div>
          <div className="text-gray-400 text-xs">
            {formatDuration(track.duration)}
          </div>
        </div>
      ))}
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default TrackList;
