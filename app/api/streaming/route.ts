import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

interface StreamingOption {
  service: {
    id: string;
    name: string;
    homePage: string;
    themeColorCode: string;
  };
  type: 'subscription' | 'rent' | 'buy' | 'free' | 'addon';
  link: string;
  quality?: string;
  price?: {
    amount: string;
    currency: string;
    formatted: string;
  };
}

interface StreamingResult {
  title: string;
  year: number;
  streamingOptions: {
    service: string;
    type: 'subscription' | 'rent' | 'buy' | 'free';
    price?: string;
    link: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const { title, year } = await req.json();

    if (!RAPIDAPI_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Search for the movie by title
    const searchUrl = `https://streaming-availability.p.rapidapi.com/shows/search/title?country=us&title=${encodeURIComponent(title)}&output_language=en&show_type=movie`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Streaming API error:', errorText);
      return NextResponse.json({ streamingOptions: [], error: 'API request failed' });
    }

    const searchData = await searchResponse.json();
    
    // Find the movie that matches our title and year
    let matchedMovie = null;
    if (searchData && Array.isArray(searchData)) {
      matchedMovie = searchData.find((movie: any) => {
        const movieYear = movie.releaseYear || movie.year;
        const titleMatch = movie.title?.toLowerCase() === title.toLowerCase();
        const yearMatch = !year || Math.abs(movieYear - year) <= 1; // Allow 1 year variance
        return titleMatch && yearMatch;
      });
      
      // If no exact match, take the first result
      if (!matchedMovie && searchData.length > 0) {
        matchedMovie = searchData[0];
      }
    }

    if (!matchedMovie) {
      return NextResponse.json({ streamingOptions: [] });
    }

    // Extract streaming options for US
    const usOptions = matchedMovie.streamingOptions?.us || [];
    
    const streamingOptions: StreamingResult['streamingOptions'] = [];
    const seenServices = new Set<string>();

    for (const option of usOptions) {
      const serviceName = option.service?.name || 'Unknown';
      const type = option.type || 'subscription';
      const key = `${serviceName}-${type}`;
      
      // Skip duplicates
      if (seenServices.has(key)) continue;
      seenServices.add(key);

      const streamingOption: StreamingResult['streamingOptions'][0] = {
        service: serviceName,
        type: type as 'subscription' | 'rent' | 'buy' | 'free',
        link: option.link || '',
      };

      // Add price if available
      if (option.price?.formatted) {
        streamingOption.price = option.price.formatted;
      }

      streamingOptions.push(streamingOption);
    }

    // Sort: subscription/free first, then by price
    streamingOptions.sort((a, b) => {
      const typeOrder = { subscription: 0, free: 1, rent: 2, buy: 3 };
      const aOrder = typeOrder[a.type] ?? 4;
      const bOrder = typeOrder[b.type] ?? 4;
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // If same type, sort by price
      const aPrice = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '999');
      const bPrice = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '999');
      return aPrice - bPrice;
    });

    return NextResponse.json({
      title: matchedMovie.title,
      year: matchedMovie.releaseYear || matchedMovie.year,
      streamingOptions,
    });

  } catch (error) {
    console.error('Streaming lookup error:', error);
    return NextResponse.json({ streamingOptions: [], error: 'Failed to lookup streaming' });
  }
}