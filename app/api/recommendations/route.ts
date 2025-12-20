import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { profile, moodProfile, excludedMovies = [] } = await request.json();

    const hardLimitLabels = [
      { id: 'no_subtitles', label: 'No subtitles / foreign language films' },
      { id: 'no_black_white', label: 'No black & white films' },
      { id: 'no_old', label: 'Nothing before 1990' },
      { id: 'no_very_old', label: 'Nothing before 1970' },
      { id: 'no_slow', label: 'No slow-burn / arthouse pacing' },
      { id: 'no_gore', label: 'No extreme gore' },
      { id: 'no_sa', label: 'No sexual assault themes' },
      { id: 'no_animal_harm', label: 'No animal death/harm' },
      { id: 'no_child_harm', label: 'No child death/harm themes' },
    ].filter(l => profile.hardLimits.includes(l.id)).map(l => l.label);

    const favoritesList = profile.favoriteMovies.filter((m: string) => m.trim());
    const recentlyWatchedList = profile.recentlyWatched.filter((m: string) => m.trim());
    const allExcluded = [...recentlyWatchedList, ...excludedMovies];

    const contextPrompt = `## USER PROFILE
Name: ${profile.name || 'Not provided'}
Viewer Type: ${profile.viewerType}
Genres they LOVE: ${profile.lovedGenres.join(', ')}
Genres they HATE: ${profile.hatedGenres.join(', ') || 'None'}
Favorite movies: ${favoritesList.length > 0 ? favoritesList.join(', ') : 'Not provided'}
DO NOT recommend these (already seen): ${allExcluded.length > 0 ? allExcluded.join(', ') : 'None'}
Hard limits: ${hardLimitLabels.length > 0 ? hardLimitLabels.join(', ') : 'None'}
Streaming services: ${profile.streamingServices.join(', ')}

## TONIGHT'S MOOD
${moodProfile.map((m: { question: string; answer: string }) => `- ${m.question}: ${m.answer}`).join('\n')}`;

    const prompt = `You are a movie recommendation expert. Based on this person's profile and current mood, suggest 5 perfect movies.

${contextPrompt}

IMPORTANT: Include the director and top 3-4 main actors for each movie.

Respond ONLY with valid JSON:
{
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2020,
      "streaming": "Netflix",
      "genre": "Primary Genre",
      "director": "Director Name",
      "cast": ["Actor 1", "Actor 2", "Actor 3", "Actor 4"],
      "pitch": "2-3 sentences on why this fits...",
      "runtime": "1h 45m",
      "vibeMatch": 92,
      "whyYou": "One sentence on why this fits YOU"
    }
  ],
  "moodSummary": "One sentence capturing their vibe tonight"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const text = textContent && 'text' in textContent ? textContent.text : '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
