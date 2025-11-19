import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { getDb, categories } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { imageToolRegistry } from '@/lib/ai/image-tools';
import '@/lib/ai/register-tools'; // Register all image tools

/**
 * AI Item Enrichment API Route
 *
 * Fetches additional metadata and images for items using AI
 * Returns enriched data including year, creator, genre, and image URL
 */

const requestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  categoryId: z.string().optional(),
  location: z.string().optional(),
});

const metadataSchema = z.object({
  year: z.string().optional(),
  creator: z.string().optional(),
  genre: z.string().optional(),
  rating: z.string().optional(),
  duration: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { title, categoryId, location } = requestSchema.parse(body);

    // Fetch category content_type from database if categoryId provided
    let contentType = 'generic';
    if (categoryId) {
      try {
        const db = getDb();
        const [categoryData] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId))
          .limit(1);

        if (categoryData) {
          contentType = categoryData.contentType || 'generic';
        }
      } catch (dbError) {
        console.error('Failed to fetch category:', dbError);
        // Continue with generic type
      }
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Construct the prompt for the AI model
    const prompt = `You are a helpful assistant that enriches item information with additional metadata.

Given the following item:
Title: ${title}
${location ? `Location: ${location}` : ''}
Content Type: ${contentType}

Please provide additional metadata for this item in JSON format. Include only relevant fields based on the content type:
- year: Year of creation/release (if applicable)
- creator: Creator/Director/Artist/Author name (if known)
- genre: Genre or category
- rating: Rating or score (if known, e.g., "8.5/10", "4.5 stars")
- duration: Duration or length (if applicable, e.g., "2h 30m", "350 pages")

Return ONLY a JSON object with these fields. Use empty strings for unknown values.

Example response for a movie:
{
  "year": "1994",
  "creator": "Quentin Tarantino",
  "genre": "Crime, Drama",
  "rating": "8.9/10",
  "duration": "2h 34m"
}

Example response for a book:
{
  "year": "1925",
  "creator": "F. Scott Fitzgerald",
  "genre": "Classic Literature",
  "rating": "3.9/5",
  "duration": "180 pages"
}`;

    // Generate AI response using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
    });

    // Parse the AI response
    let metadata;
    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        metadata = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        metadata = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return empty metadata if parsing fails
      metadata = {};
    }

    // Validate metadata format
    const validatedMetadata = metadataSchema.parse(metadata);

    // Fetch image using the appropriate tool based on content_type
    let imageUrl: string | undefined;

    try {
      // For place-based content types, append location to search query
      const searchQuery =
        (contentType === 'place' ||
          contentType === 'travel' ||
          contentType === 'restaurant') &&
        location
          ? `${title} ${location}`
          : title;

      imageUrl = await imageToolRegistry.getImage(
        contentType,
        searchQuery,
        validatedMetadata.year
      );
    } catch (imageError) {
      console.error('Failed to fetch image:', imageError);
      // imageToolRegistry.getImage already returns placeholder on error
    }

    return NextResponse.json({
      metadata: validatedMetadata,
      imageUrl,
    });
  } catch (error) {
    console.error('AI enrichment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enrich item. Please try again.' },
      { status: 500 }
    );
  }
}
