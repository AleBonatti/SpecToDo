/**
 * Spotify Music Image Search Tool
 *
 * Integrates with Spotify API to fetch album cover images
 * Uses Spotify Web API with Client Credentials flow
 */

import { BaseImageSearchTool } from '../image-tools';

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
}

export interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
    total: number;
  };
}

/**
 * Music Image Search Tool using Spotify API
 *
 * Spotify requires OAuth for authentication:
 * 1. Register your app at https://developer.spotify.com/dashboard
 * 2. Get Client ID and Client Secret
 * 3. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local
 */
export class MusicImageTool extends BaseImageSearchTool {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiBaseUrl = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId?: string, clientSecret?: string) {
    super();
    this.clientId = clientId || process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = clientSecret || process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  /**
   * Get or refresh OAuth access token from Spotify
   */
  private async getAccessToken(): Promise<string | null> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn('Spotify credentials not configured');
      return null;
    }

    try {
      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString('base64');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        console.error(
          'Spotify OAuth error:',
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Token expires in seconds, convert to milliseconds and subtract 5 minutes for safety
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 300000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return null;
    }
  }

  /**
   * Fetch album cover image from Spotify
   */
  async fetchImage(searchQuery: string): Promise<string | undefined> {
    const token = await this.getAccessToken();

    if (!token) {
      console.warn('Spotify authentication failed');
      return this.getPlaceholderImage('music');
    }

    try {
      // Extract year from search query if present
      const yearMatch = searchQuery.match(/\b(19\d{2}|20\d{2})\b/);
      const year = yearMatch ? yearMatch[1] : undefined;

      // Remove year from query to get clean search term
      const searchTerm = year
        ? searchQuery.replace(year, '').trim()
        : searchQuery;

      // Build Spotify search query
      // Search for albums with the given name
      let query = encodeURIComponent(searchTerm);

      // Add year filter if available
      if (year) {
        query += encodeURIComponent(` year:${year}`);
      }

      const searchUrl = `${this.apiBaseUrl}/search?q=${query}&type=album&limit=1`;

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          'Spotify API error:',
          response.status,
          response.statusText
        );
        return this.getPlaceholderImage('music');
      }

      const data: SpotifySearchResponse = await response.json();

      if (!data.albums || !data.albums.items || data.albums.items.length === 0) {
        console.warn('No album found for query:', searchQuery);
        return this.getPlaceholderImage('music');
      }

      const album = data.albums.items[0];

      if (!album.images || album.images.length === 0) {
        console.warn('No cover image available for album:', album.name);
        return this.getPlaceholderImage('music');
      }

      // Spotify returns images in descending size order
      // Get the first image (largest) or medium-sized one
      const imageUrl =
        album.images.find((img) => img.height && img.height <= 640)?.url ||
        album.images[0]?.url;

      if (!imageUrl) {
        console.warn('No valid image URL for album:', album.name);
        return this.getPlaceholderImage('music');
      }

      return imageUrl;
    } catch (error) {
      console.error('Error fetching album image from Spotify:', error);
      return this.getPlaceholderImage('music');
    }
  }

  /**
   * Override validation to skip HEAD request for Spotify images
   * Spotify images are reliable and always accessible
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    // Spotify image URLs are reliable, skip validation to save API calls
    if (imageUrl.includes('i.scdn.co')) {
      return true;
    }

    // For non-Spotify URLs, use the default validation
    return super.validateImageUrl(imageUrl);
  }
}
