import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, year } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Search for reviews of the movie "${title}" (${year}). Find critic and audience reviews from sites like Rotten Tomatoes, IMDB, Letterboxd, or major publications.

Return exactly this JSON format with 3-5 real reviews you find:
{
  "reviews": [
    {
      "author": "Critic/User Name",
      "source": "Publication/Site Name",
      "rating": 4,
      "text": "Brief excerpt from their review (1-2 sentences max)"
    }
  ],
  "rtScore": "Rotten Tomatoes score if found (e.g. '92%')",
  "imdbScore": "IMDB score if found (e.g. '8.1/10')",
  "consensus": "Brief critical consensus if available"
}`
      }]
    });

    const textContent = response.content
      .filter(c => c.type === 'text')
      .map(c => 'text' in c ? c.text : '')
      .join('');

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ reviews: [], rtScore: null, imdbScore: null, consensus: null });
  } catch (error) {
    console.error('Reviews error:', error);
    return NextResponse.json({ reviews: [], error: true }, { status: 500 });
  }
}
