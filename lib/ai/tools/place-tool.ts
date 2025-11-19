/**
 * Google Places Image Search Tool
 *
 * Integrates with Google Places API (New) to fetch place photos
 * Uses the Places API (New) with Text Search and Place Photos
 */

import { BaseImageSearchTool } from '../image-tools';

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}

export interface GooglePlace {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  photos?: PlacePhoto[];
  formattedAddress?: string;
}

export interface GooglePlacesSearchResponse {
  places?: GooglePlace[];
}

/**
 * Place Image Search Tool using Google Places API (New)
 *
 * IMPORTANT: Google Places API requires billing to be enabled
 *
 * Setup steps:
 * 1. Enable billing at https://console.cloud.google.com/billing (includes $200 monthly free credit)
 * 2. Enable Places API (New) at https://console.cloud.google.com/apis/library/places-backend.googleapis.com
 * 3. Create API key at https://console.cloud.google.com/apis/credentials
 * 4. For API restrictions: Use "None" or "IP addresses" (NOT "HTTP referrers" - that's client-side only)
 * 5. Add GOOGLE_PLACES_API_KEY to .env.local
 *
 * Common 403 error causes:
 * - Billing not enabled on the Google Cloud project
 * - Places API (New) not enabled
 * - API key has HTTP referrer restrictions (server-side calls need "None" or "IP addresses")
 * - API key doesn't have Places API enabled
 *
 * Pricing: https://mapsplatform.google.com/pricing/
 */
export class PlaceImageTool extends BaseImageSearchTool {
  private readonly apiKey: string;
  private readonly searchUrl =
    'https://places.googleapis.com/v1/places:searchText';
  private readonly photoBaseUrl = 'https://places.googleapis.com/v1';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.GOOGLE_PLACES_API_KEY || '';
  }

  /**
   * Fetch place photo from Google Places API
   */
  async fetchImage(searchQuery: string): Promise<string | undefined> {
    if (!this.apiKey) {
      console.warn('Google Places API key not configured');
      return this.getPlaceholderImage('place');
    }

    try {
      // Extract location/country from search query if present
      // For better results, search query should include location info
      // e.g., "Eiffel Tower Paris", "Colosseum Rome"

      // Search for the place using Text Search
      const searchResponse = await fetch(this.searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.photos,places.formattedAddress',
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          languageCode: 'en',
          maxResultCount: 1,
        }),
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse
          .text()
          .catch(() => 'Unknown error');
        console.error(
          'Google Places API error:',
          searchResponse.status,
          searchResponse.statusText,
          '\nResponse body:',
          errorText
        );

        // Provide helpful error message for common issues
        if (searchResponse.status === 403) {
          console.error(
            'Places API 403 error. Common causes:\n' +
              '1. Billing not enabled on Google Cloud project (required even with free credit)\n' +
              '2. Places API (New) not enabled at https://console.cloud.google.com/apis/library/places-backend.googleapis.com\n' +
              '3. API key restrictions blocking server-side requests\n' +
              '4. Check API key at https://console.cloud.google.com/apis/credentials'
          );
        }

        return this.getPlaceholderImage('place');
      }

      const data: GooglePlacesSearchResponse = await searchResponse.json();

      if (!data.places || data.places.length === 0) {
        console.warn('No place found for query:', searchQuery);
        return this.getPlaceholderImage('place');
      }

      const place = data.places[0];

      if (!place.photos || place.photos.length === 0) {
        console.warn('No photos available for place:', place.displayName.text);
        return this.getPlaceholderImage('place');
      }

      // Get the first photo (usually the most representative)
      const photo = place.photos[0];

      // Construct the photo URL using the Photo Media API
      // Format: https://places.googleapis.com/v1/{photo.name}/media?key=API_KEY&maxWidthPx=WIDTH&maxHeightPx=HEIGHT
      // We'll use a reasonable size for display (800px wide)
      const photoUrl = `${this.photoBaseUrl}/${photo.name}/media?key=${this.apiKey}&maxWidthPx=800`;

      return photoUrl;
    } catch (error) {
      console.error('Error fetching place image from Google Places:', error);
      return this.getPlaceholderImage('place');
    }
  }

  /**
   * Override validation to skip HEAD request for Google Places images
   * Google Places images are reliable and always accessible
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    // Google Places image URLs are reliable, skip validation to save API calls
    if (imageUrl.includes('places.googleapis.com')) {
      return true;
    }

    // For non-Google Places URLs, use the default validation
    return super.validateImageUrl(imageUrl);
  }
}
