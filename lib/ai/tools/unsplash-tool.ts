/**
 * Unsplash Image Search Tool
 *
 * Integrates with Unsplash API to fetch high-quality images for generic content
 * Used as a fallback for content types that don't have specialized tools
 */

import { BaseImageSearchTool } from '../image-tools';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
    username: string;
  };
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Generic Image Search Tool using Unsplash API
 *
 * Setup:
 * 1. Create an account at https://unsplash.com/developers
 * 2. Register a new application
 * 3. Get your Access Key
 * 4. Add UNSPLASH_ACCESS_KEY to .env.local
 *
 * API Limits (Free tier):
 * - 50 requests per hour (Demo mode)
 * - 5,000 requests per hour (Production mode - requires app approval)
 *
 * Pricing: https://unsplash.com/developers
 */
export class UnsplashImageTool extends BaseImageSearchTool {
  private readonly accessKey: string;
  private readonly apiBaseUrl = 'https://api.unsplash.com';

  constructor(accessKey?: string) {
    super();
    this.accessKey = accessKey || process.env.UNSPLASH_ACCESS_KEY || '';
  }

  /**
   * Fetch image from Unsplash
   */
  async fetchImage(searchQuery: string): Promise<string | undefined> {
    if (!this.accessKey) {
      console.warn('Unsplash Access Key not configured');
      return this.getPlaceholderImage('generic');
    }

    try {
      // Build search URL
      const searchUrl = `${this.apiBaseUrl}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;

      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(
          'Unsplash API error:',
          response.status,
          response.statusText,
          '\nResponse body:',
          errorText
        );

        // Provide helpful error message for common issues
        if (response.status === 401) {
          console.error(
            'Unsplash API 401 error. Check that:\n' +
              '1. UNSPLASH_ACCESS_KEY is set correctly in .env.local\n' +
              '2. Your Access Key is valid at https://unsplash.com/oauth/applications'
          );
        } else if (response.status === 403) {
          console.error(
            'Unsplash API 403 error. This may indicate:\n' +
              '1. Rate limit exceeded (50 requests/hour for Demo apps)\n' +
              '2. Your app needs to be approved for Production mode\n' +
              '3. Check your app status at https://unsplash.com/oauth/applications'
          );
        }

        return this.getPlaceholderImage('generic');
      }

      const data: UnsplashSearchResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        console.warn('No image found on Unsplash for query:', searchQuery);
        return this.getPlaceholderImage('generic');
      }

      const photo = data.results[0];

      // Use 'regular' size (width ~1080px) for good quality without being too large
      // Available sizes: raw, full, regular, small, thumb
      const imageUrl = photo.urls.regular;

      // Optional: Log attribution info (Unsplash requires attribution in production)
      console.log(
        `Using Unsplash photo by ${photo.user.name} (@${photo.user.username})`
      );

      return imageUrl;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return this.getPlaceholderImage('generic');
    }
  }

  /**
   * Override validation to skip HEAD request for Unsplash images
   * Unsplash images are reliable and always accessible
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    // Unsplash image URLs are reliable, skip validation to save API calls
    if (imageUrl.includes('images.unsplash.com')) {
      return true;
    }

    // For non-Unsplash URLs, use the default validation
    return super.validateImageUrl(imageUrl);
  }
}
