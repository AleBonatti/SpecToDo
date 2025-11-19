/**
 * Image Tool Registry Initialization
 *
 * Registers all image search tools with the global registry.
 * Import this file in API routes that need image search functionality.
 */

import { imageToolRegistry } from './image-tools';
import { MovieImageTool } from './tools/movie-tool';
import { GameImageTool } from './tools/game-tool';
import { MusicImageTool } from './tools/music-tool';
import { BookImageTool } from './tools/book-tool';
import { PlaceImageTool } from './tools/place-tool';
import { UnsplashImageTool } from './tools/unsplash-tool';

// Register all image search tools
let initialized = false;

export function registerImageTools() {
  if (initialized) return;

  imageToolRegistry.register('cinema', new MovieImageTool());
  imageToolRegistry.register('game', new GameImageTool());
  imageToolRegistry.register('music', new MusicImageTool());
  imageToolRegistry.register('book', new BookImageTool());
  imageToolRegistry.register('place', new PlaceImageTool());
  imageToolRegistry.register('travel', new PlaceImageTool());
  imageToolRegistry.register('restaurant', new PlaceImageTool());
  imageToolRegistry.register('generic', new UnsplashImageTool());

  initialized = true;
}

// Auto-register on import
registerImageTools();
