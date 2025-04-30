// types/wavlake.ts

export interface Track {
  id: string;
  title: string;
  albumArtUrl: string;
  artistArtUrl: string;
  artistId: string;
  albumId: string;
  albumTitle: string;
  mediaUrl: string;
  artist: string;
  url: string;
  msatTotal: string;
  duration: number;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  description?: string;
  createdAt?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  description?: string;
  createdAt?: string;
  tracks?: Track[];
}
