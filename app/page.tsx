'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, ChevronLeft, RefreshCw, Check, Home } from 'lucide-react';

// Types
interface Profile {
  name: string;
  viewerType: string;
  lovedGenres: string[];
  hatedGenres: string[];
  favoriteMovies: string[];
  recentlyWatched: string[];
  hardLimits: string[];
  streamingServices: string[];
}

interface Movie {
  title: string;
  year: number;
  streaming: string;
  genre: string;
  director?: string;
  cast?: string[];
  pitch: string;
  runtime: string;
  vibeMatch: number;
  whyYou?: string;
}

interface MoodAnswer {
  question: string;
  answer: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source?: string;
}

interface ExternalReviews {
  reviews: Review[];
  rtScore?: string;
  imdbScore?: string;
  consensus?: string;
}

// Constants
const GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Fantasy', 'Romance', 
  'Thriller', 'Documentary', 'Animation', 'Crime', 'Mystery', 'Adventure',
  'War', 'Western', 'Musical', 'Biography', 'Sport', 'Family', 'Indie'
];

const HARD_LIMITS = [
  { id: 'no_subtitles', label: 'No subtitles / foreign language films' },
  { id: 'no_black_white', label: 'No black & white films' },
  { id: 'no_old', label: 'Nothing before 1990' },
  { id: 'no_very_old', label: 'Nothing before 1970' },
  { id: 'no_slow', label: 'No slow-burn / arthouse pacing' },
  { id: 'no_gore', label: 'No extreme gore' },
  { id: 'no_sa', label: 'No sexual assault themes' },
  { id: 'no_animal_harm', label: 'No animal death/harm' },
  { id: 'no_child_harm', label: 'No child death/harm themes' },
];

const VIEWER_TYPES = [
  { id: 'casual', label: '🥭 Casual', desc: 'I watch a few movies a month, mostly mainstream' },
  { id: 'regular', label: '🎬 Regular', desc: 'I watch weekly, mix of popular and some deeper cuts' },
  { id: 'enthusiast', label: '🎥 Enthusiast', desc: 'I actively seek out films, know directors, follow critics' },
  { id: 'cinephile', label: '🌴 Cinephile', desc: 'Film is a passion, I watch everything including classics and foreign' },
];

const STREAMING_SERVICES = [
  'Netflix', 'Amazon Prime', 'Hulu', 'HBO Max', 'Disney+', 
  'Paramount+', 'Peacock', 'Apple TV+', 'Tubi', 'Criterion Channel'
];

const QUESTION_POOL = [
  {
    id: 'energy',
    question: "How's your brain feeling right now?",
    options: [
      { value: 'fried', label: '🥵 Completely fried' },
      { value: 'tired', label: '😴 Pretty tired' },
      { value: 'normal', label: '😌 Normal, functional' },
      { value: 'wired', label: '⚡ Wired and ready' },
    ]
  },
  {
    id: 'social',
    question: "Who's watching with you?",
    options: [
      { value: 'solo', label: '🥭 Just me and my mangos' },
      { value: 'partner', label: '💑 Partner/date' },
      { value: 'friends', label: '🍻 Friends' },
      { value: 'family', label: '👨‍👩‍👧‍👦 Family/mixed group' },
    ]
  },
  {
    id: 'emotional_risk',
    question: "How emotionally available are you tonight?",
    options: [
      { value: 'none', label: '🛡️ Protect me at all costs' },
      { value: 'little', label: '🤏 A little tug is fine' },
      { value: 'ready', label: '💪 I can handle some feelings' },
      { value: 'destroy', label: '😭 Destroy me, I need a cry' },
    ]
  },
  {
    id: 'familiarity',
    question: "Comfort food or trying something new?",
    options: [
      { value: 'comfort', label: '🛋️ Something familiar and cozy' },
      { value: 'mild_new', label: '🌱 New but not too weird' },
      { value: 'adventurous', label: '🗺️ Show me something different' },
      { value: 'wild', label: '🎲 Fuck it, surprise me' },
    ]
  },
  {
    id: 'attention',
    question: "How much of your attention can you give?",
    options: [
      { value: 'phone', label: '📱 I will be on my phone' },
      { value: 'half', label: '👀 Half paying attention' },
      { value: 'full', label: '🎬 Full cinema mode' },
      { value: 'obsess', label: '🔍 I want to analyze every frame' },
    ]
  },
  {
    id: 'length',
    question: "How much time you got?",
    options: [
      { value: 'short', label: '⏱️ Under 90 min' },
      { value: 'normal', label: '🎬 Standard movie (90-120)' },
      { value: 'long', label: "📽️ I'm committed (2+ hours)" },
      { value: 'binge', label: '📺 Series/multiple movies' },
    ]
  },
  {
    id: 'decade_vibe',
    question: "What era sounds good?",
    options: [
      { value: 'classic', label: '🎞️ Old school (pre-1990)' },
      { value: 'nostalgic', label: '📼 90s-2000s nostalgia' },
      { value: 'modern', label: '🆕 Recent stuff (2015+)' },
      { value: 'any', label: "🤷 Era doesn't matter" },
    ]
  },
  {
    id: 'laugh',
    question: "Do you want to laugh?",
    options: [
      { value: 'must', label: '😂 Yes, mandatory laughs' },
      { value: 'nice', label: '😄 Laughs would be nice' },
      { value: 'dont_care', label: '😐 Not important' },
      { value: 'serious', label: '🎭 Keep it serious' },
    ]
  },
  {
    id: 'violence',
    question: "Violence/intensity tolerance tonight?",
    options: [
      { value: 'none', label: '🕊️ Keep it peaceful' },
      { value: 'mild', label: '💥 Action is fine, nothing brutal' },
      { value: 'bring_it', label: '🔥 Bring the intensity' },
      { value: 'extreme', label: '💀 I want chaos' },
    ]
  },
  {
    id: 'thinking',
    question: "How much do you want to think?",
    options: [
      { value: 'zero', label: '🧘 Zero thoughts, head empty' },
      { value: 'little', label: '💭 Light thinking only' },
      { value: 'engaged', label: '🧩 Engage my brain' },
      { value: 'puzzle', label: '🤯 I want a puzzle' },
    ]
  },
  {
    id: 'escapism',
    question: "Reality or escape?",
    options: [
      { value: 'ground', label: '🏠 Keep me grounded' },
      { value: 'light_escape', label: '🌴 Light escapism' },
      { value: 'fantasy', label: '🚀 Take me somewhere else' },
      { value: 'weird', label: '🌀 Get weird with it' },
    ]
  },
  {
    id: 'ending',
    question: "How should it end?",
    options: [
      { value: 'happy', label: '🌈 Happy ending please' },
      { value: 'satisfying', label: '✅ Satisfying resolution' },
      { value: 'ambiguous', label: '❓ Ambiguous is cool' },
      { value: 'dark', label: '🖤 I can handle a dark ending' },
    ]
  },
  {
    id: 'romance',
    question: "Romance in the movie?",
    options: [
      { value: 'central', label: '💕 Yes, make it the focus' },
      { value: 'subplot', label: '💘 Nice as a subplot' },
      { value: 'dont_care', label: "🤷 Don't care either way" },
      { value: 'none', label: '🙅 Keep romance out' },
    ]
  },
  {
    id: 'day_type',
    question: "What kind of day did you have?",
    options: [
      { value: 'shit', label: '💩 Absolute garbage day' },
      { value: 'stressful', label: '😰 Stressful but survived' },
      { value: 'fine', label: '😌 Pretty decent actually' },
      { value: 'great', label: '🎉 Amazing, ride this high' },
    ]
  },
  {
    id: 'scared',
    question: "How do you feel about being scared?",
    options: [
      { value: 'no', label: '🙈 Hard no' },
      { value: 'mild', label: '👻 Mild spooks only' },
      { value: 'yes', label: '😱 Scare me' },
      { value: 'terror', label: '💀 Traumatize me' },
    ]
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getMovieKey(title: string, year: number): string {
  return `reviews:${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${year}`;
}

// Mango Rating Component
function MangoRating({ rating, onRate, readonly = false, size = 'normal' }: {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'normal';
}) {
  const [hover, setHover] = useState(0);
  const mangos = [1, 2, 3, 4, 5];
  const sizeClass = size === 'small' ? 'text-lg' : 'text-2xl';
  
  return (
    <div className="flex gap-1">
      {mangos.map(mango => (
        <button
          key={mango}
          disabled={readonly}
          onClick={() => onRate && onRate(mango)}
          onMouseEnter={() => !readonly && setHover(mango)}
          onMouseLeave={() => setHover(0)}
          className={`${sizeClass} ${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readonly && 'hover:scale-110'}`}
        >
          {(hover || rating) >= mango ? '🥭' : '○'}
        </button>
      ))}
    </div>
  );
}

// Review Card Component
function ReviewCard({ review, isExternal = false }: { review: Review; isExternal?: boolean }) {
  return (
    <div className={`p-4 rounded-xl ${isExternal ? 'bg-amber-500/10 border border-amber-400/30' : 'bg-orange-500/10 border border-orange-400/30'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-white">{review.author}</span>
          {review.source && (
            <span className="text-xs text-amber-200 ml-2 bg-white/10 px-2 py-0.5 rounded">{review.source}</span>
          )}
        </div>
        <MangoRating rating={review.rating} readonly size="small" />
      </div>
      <p className="text-orange-100 text-sm">{review.text}</p>
      {review.date && <p className="text-amber-300/60 text-xs mt-2">{review.date}</p>}
    </div>
  );
}

// Write Review Modal
function WriteReviewModal({ movie, profile, onSubmit, onClose }: {
  movie: Movie;
  profile: Profile;
  onSubmit: (review: Review) => Promise<void>;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const review: Review = {
      id: Date.now().toString(),
      author: profile.name || 'Anonymous',
      rating,
      text: text.trim(),
      date: new Date().toLocaleDateString(),
    };
    await onSubmit(review);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-2xl p-6 max-w-md w-full border border-amber-500/30">
        <h2 className="text-xl font-bold text-white mb-2">Review {movie.title}</h2>
        <p className="text-amber-200 text-sm mb-4">Share your thoughts with the community</p>
        <div className="mb-4">
          <label className="block text-amber-100 mb-2">Your Rating</label>
          <MangoRating rating={rating} onRate={setRating} />
        </div>
        <div className="mb-6">
          <label className="block text-amber-100 mb-2">Your Review (optional)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think?"
            rows={4}
            className="w-full p-3 bg-white/10 border border-amber-500/30 rounded-xl text-white placeholder-amber-300/50 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Review 🥭'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Movie Detail Modal
function MovieDetailModal({ movie, profile, onClose, onMarkWatched }: {
  movie: Movie;
  profile: Profile;
  onClose: () => void;
  onMarkWatched: (movie: Movie) => Promise<void>;
}) {
  const [externalReviews, setExternalReviews] = useState<ExternalReviews>({ reviews: [] });
  const [communityReviews, setCommunityReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [activeTab, setActiveTab] = useState('external');

  useEffect(() => {
    loadAllReviews();
  }, [movie]);

  const loadAllReviews = async () => {
    setLoadingReviews(true);
    await Promise.all([fetchExternalReviews(), loadCommunityReviews()]);
    setLoadingReviews(false);
  };

  const fetchExternalReviews = async () => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: movie.title, year: movie.year })
      });
      const data = await response.json();
      setExternalReviews(data);
    } catch (err) {
      setExternalReviews({ reviews: [] });
    }
  };

  const loadCommunityReviews = async () => {
    try {
      const key = getMovieKey(movie.title, movie.year);
      const stored = localStorage.getItem(key);
      if (stored) setCommunityReviews(JSON.parse(stored));
    } catch (err) {
      setCommunityReviews([]);
    }
  };

  const submitReview = async (review: Review) => {
    const key = getMovieKey(movie.title, movie.year);
    const updatedReviews = [...communityReviews, review];
    localStorage.setItem(key, JSON.stringify(updatedReviews));
    setCommunityReviews(updatedReviews);
    setShowWriteReview(false);
  };

  const communityAvgRating = communityReviews.length > 0
    ? (communityReviews.reduce((sum, r) => sum + r.rating, 0) / communityReviews.length).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-40 overflow-y-auto">
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto border border-amber-500/30">
        <div className="p-6 border-b border-amber-500/20">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <div className="flex gap-3 mt-2 text-sm flex-wrap">
                <span className="bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded font-medium">{movie.year}</span>
                <span className="bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded">{movie.streaming}</span>
                <span className="bg-white/10 text-amber-200 px-2 py-0.5 rounded">{movie.genre}</span>
                <span className="text-amber-200">{movie.runtime}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-amber-300 hover:text-white text-2xl">✕</button>
          </div>
          
          {movie.director && (
            <div className="mt-4">
              <span className="text-amber-400 text-sm">Directed by </span>
              <span className="text-white font-medium">{movie.director}</span>
            </div>
          )}
          
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-3">
              <span className="text-amber-400 text-sm block mb-2">Starring</span>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, idx) => (
                  <span key={idx} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">🎭 {actor}</span>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-orange-100 mt-4">{movie.pitch}</p>
          
          <div className="flex gap-4 mt-4 flex-wrap">
            {externalReviews.rtScore && (
              <div className="bg-red-500/20 px-3 py-1 rounded-lg">
                <span className="text-red-400 font-bold">🍅 {externalReviews.rtScore}</span>
              </div>
            )}
            {externalReviews.imdbScore && (
              <div className="bg-yellow-500/20 px-3 py-1 rounded-lg">
                <span className="text-yellow-400 font-bold">⭐ {externalReviews.imdbScore}</span>
              </div>
            )}
            {communityAvgRating && (
              <div className="bg-orange-500/20 px-3 py-1 rounded-lg">
                <span className="text-orange-300 font-bold">🥭 {communityAvgRating}/5</span>
                <span className="text-orange-400 text-sm ml-1">({communityReviews.length})</span>
              </div>
            )}
            <div className="bg-green-500/20 px-3 py-1 rounded-lg">
              <span className="text-green-400 font-bold">🎯 {movie.vibeMatch}%</span>
            </div>
          </div>

          {externalReviews.consensus && (
            <p className="text-amber-200 italic mt-4 text-sm border-l-2 border-amber-400 pl-3">{externalReviews.consensus}</p>
          )}
        </div>

        <div className="flex border-b border-amber-500/20">
          <button
            onClick={() => setActiveTab('external')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'external' ? 'text-white border-b-2 border-amber-400' : 'text-amber-300 hover:text-white'}`}
          >
            🎬 Critics & Press
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'community' ? 'text-white border-b-2 border-amber-400' : 'text-amber-300 hover:text-white'}`}
          >
            🥭 Community ({communityReviews.length})
          </button>
        </div>

        <div className="p-6">
          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="animate-bounce text-4xl mb-2">🥭</div>
              <p className="text-amber-300">Loading reviews...</p>
            </div>
          ) : activeTab === 'external' ? (
            <div className="space-y-3">
              {externalReviews.reviews?.length > 0 ? (
                externalReviews.reviews.map((review, idx) => <ReviewCard key={idx} review={review} isExternal />)
              ) : (
                <p className="text-amber-300 text-center py-4">No external reviews found</p>
              )}
            </div>
          ) : (
            <div>
              <button onClick={() => setShowWriteReview(true)} className="w-full py-3 mb-4 bg-orange-500/20 border border-orange-400/50 text-orange-200 rounded-xl hover:bg-orange-500/30">
                ✍️ Write a Review
              </button>
              <div className="space-y-3">
                {communityReviews.length > 0 ? (
                  communityReviews.slice().reverse().map((review, idx) => <ReviewCard key={idx} review={review} />)
                ) : (
                  <p className="text-amber-300 text-center py-4">No community reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-amber-500/20 flex gap-3">
          <button onClick={() => { onMarkWatched(movie); onClose(); }} className="flex-1 py-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30">✓ Mark as Watched</button>
          <button onClick={onClose} className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">Close</button>
        </div>
      </div>

      {showWriteReview && <WriteReviewModal movie={movie} profile={profile} onSubmit={submitReview} onClose={() => setShowWriteReview(false)} />}
    </div>
  );
}

// Profile Setup Component
function ProfileSetup({ onComplete, existingProfile }: { onComplete: (profile: Profile) => void; existingProfile: Profile | null; }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile>(existingProfile || {
    name: '', viewerType: '', lovedGenres: [], hatedGenres: [], favoriteMovies: ['', '', ''],
    recentlyWatched: [], hardLimits: [], streamingServices: ['Netflix', 'Amazon Prime'],
  });

  const updateProfile = (key: keyof Profile, value: Profile[keyof Profile]) => setProfile(prev => ({ ...prev, [key]: value }));
  const toggleArrayItem = (key: 'lovedGenres' | 'hatedGenres' | 'hardLimits' | 'streamingServices', item: string) => {
    setProfile(prev => ({ ...prev, [key]: prev[key].includes(item) ? prev[key].filter(i => i !== item) : [...prev[key], item] }));
  };
  const updateArrayIndex = (key: 'favoriteMovies' | 'recentlyWatched', index: number, value: string) => {
    setProfile(prev => { const newArray = [...prev[key]]; newArray[index] = value; return { ...prev, [key]: newArray }; });
  };

  const totalSteps = 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="mb-6">
          <div className="flex justify-between text-amber-200 text-sm mb-2">
            <span>Profile Setup</span>
            <span>Step {step} of {totalSteps}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-amber-500/30">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">🥭 Let&apos;s get to know you</h2>
              <div className="mb-6">
                <label className="block text-amber-100 mb-2">What should we call you?</label>
                <input type="text" value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} placeholder="Your name"
                  className="w-full p-3 bg-white/10 border border-amber-500/30 rounded-xl text-white placeholder-amber-300/50 focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="block text-amber-100 mb-3">What kind of movie watcher are you?</label>
                <div className="space-y-2">
                  {VIEWER_TYPES.map(type => (
                    <button key={type.id} onClick={() => updateProfile('viewerType', type.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${profile.viewerType === type.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400' : 'bg-white/5 border-white/10 hover:bg-white/10'} border`}>
                      <div className="text-white font-medium">{type.label}</div>
                      <div className="text-amber-100 text-sm">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Genres you love 🌴</h2>
              <p className="text-amber-200 mb-6">Pick your favorites (at least 2)</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button key={genre} onClick={() => toggleArrayItem('lovedGenres', genre)} disabled={profile.hatedGenres.includes(genre)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${profile.lovedGenres.includes(genre) ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : profile.hatedGenres.includes(genre) ? 'bg-white/5 text-amber-300/30 cursor-not-allowed' : 'bg-white/10 text-amber-100 hover:bg-white/20'}`}>
                    {profile.lovedGenres.includes(genre) && '🥭 '}{genre}
                  </button>
                ))}
              </div>
              {profile.lovedGenres.length > 0 && <p className="text-green-400 mt-4">🥭 {profile.lovedGenres.join(', ')}</p>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Genres to avoid 🚫</h2>
              <p className="text-amber-200 mb-6">What do you never want recommended?</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button key={genre} onClick={() => toggleArrayItem('hatedGenres', genre)} disabled={profile.lovedGenres.includes(genre)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${profile.hatedGenres.includes(genre) ? 'bg-red-500 text-white' : profile.lovedGenres.includes(genre) ? 'bg-white/5 text-amber-300/30 cursor-not-allowed' : 'bg-white/10 text-amber-100 hover:bg-white/20'}`}>
                    {profile.hatedGenres.includes(genre) && '🚫 '}{genre}
                  </button>
                ))}
              </div>
              {profile.hatedGenres.length > 0 && <p className="text-red-400 mt-4">🚫 {profile.hatedGenres.join(', ')}</p>}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Some favorites 🎬</h2>
              <p className="text-amber-200 mb-6">Name a few movies you love</p>
              <div className="space-y-3">
                {profile.favoriteMovies.map((movie, index) => (
                  <input key={index} type="text" value={movie} onChange={(e) => updateArrayIndex('favoriteMovies', index, e.target.value)} placeholder={`Favorite movie ${index + 1}`}
                    className="w-full p-3 bg-white/10 border border-amber-500/30 rounded-xl text-white placeholder-amber-300/50 focus:outline-none focus:border-amber-400" />
                ))}
              </div>
              <button onClick={() => updateProfile('favoriteMovies', [...profile.favoriteMovies, ''])} className="mt-3 text-amber-300 hover:text-amber-100 text-sm">+ Add another</button>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Hard limits 🛑</h2>
              <p className="text-amber-200 mb-6">Anything we should never recommend?</p>
              <div className="space-y-2">
                {HARD_LIMITS.map(limit => (
                  <button key={limit.id} onClick={() => toggleArrayItem('hardLimits', limit.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${profile.hardLimits.includes(limit.id) ? 'bg-red-500/30 border-red-400' : 'bg-white/5 border-white/10 hover:bg-white/10'} border`}>
                    <span className="text-xl">{profile.hardLimits.includes(limit.id) ? '🚫' : '⬜'}</span>
                    <span className="text-white">{limit.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your streaming services 📺</h2>
              <p className="text-amber-200 mb-6">What do you have access to?</p>
              <div className="flex flex-wrap gap-2">
                {STREAMING_SERVICES.map(service => (
                  <button key={service} onClick={() => toggleArrayItem('streamingServices', service)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${profile.streamingServices.includes(service) ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-white/10 text-amber-100 hover:bg-white/20'}`}>
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-6 py-2 text-amber-300 hover:text-white disabled:opacity-30">← Back</button>
            {step < totalSteps ? (
              <button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !profile.viewerType) || (step === 2 && profile.lovedGenres.length < 2)}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50">Next →</button>
            ) : (
              <button onClick={() => onComplete(profile)} disabled={profile.streamingServices.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold">Save Profile 🥭</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Movie Card Component
function MovieCard({ movie, index, onSelect, onSeenIt, isSwapping }: { movie: Movie; index: number; onSelect: (movie: Movie) => void; onSeenIt: (movie: Movie, index: number) => void; isSwapping: boolean; }) {
  return (
    <div className={`bg-white/10 backdrop-blur rounded-2xl p-5 border border-amber-500/30 hover:border-amber-400 transition-all ${isSwapping ? 'opacity-50 animate-pulse' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{index + 1}. {movie.title}</h3>
          <div className="flex gap-2 flex-wrap text-sm mt-1">
            <span className="bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded font-medium">{movie.year}</span>
            <span className="bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded">{movie.streaming}</span>
            <span className="bg-white/10 text-amber-200 px-2 py-0.5 rounded">{movie.genre}</span>
            <span className="text-amber-200">{movie.runtime}</span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-green-400">{movie.vibeMatch}%</div>
          <div className="text-xs text-amber-300">match</div>
        </div>
      </div>
      {movie.director && (<div className="mt-2"><span className="text-amber-400 text-sm">Dir: </span><span className="text-white text-sm">{movie.director}</span></div>)}
      {movie.cast && movie.cast.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.cast.slice(0, 3).map((actor, idx) => (<span key={idx} className="bg-white/5 text-amber-100 px-2 py-0.5 rounded text-xs">{actor}</span>))}
          {movie.cast.length > 3 && <span className="text-amber-400 text-xs">+{movie.cast.length - 3} more</span>}
        </div>
      )}
      <p className="text-orange-100 mt-3">{movie.pitch}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => onSelect(movie)} className="flex-1 py-2 bg-amber-500/20 text-amber-200 rounded-xl hover:bg-amber-500/30 text-sm">📖 Reviews & Details</button>
        <button onClick={() => onSeenIt(movie, index)} disabled={isSwapping} className="py-2 px-4 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 text-sm disabled:opacity-50">{isSwapping ? '🔄' : '👁️ Seen It'}</button>
      </div>
    </div>
  );
}

// Loading messages
const LOADING_MESSAGES = [
  "Picking the ripest movies...",
  "Checking the vibe...",
  "Asking the mango tree...",
  "Almost ripe...",
  "Finding your perfect match...",
];

// Main App
export default function MangoMovies() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stage, setStage] = useState('intro');
  const [questions, setQuestions] = useState<typeof QUESTION_POOL>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; label: string }>>({});
  const [recommendations, setRecommendations] = useState<{ recommendations: Movie[]; moodSummary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const sessionContext = useRef<{ moodProfile: MoodAnswer[] | null; excludedMovies: string[] }>({ moodProfile: null, excludedMovies: [] });
  const touchStartX = useRef<number | null>(null);
  
  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const createSwipeEnd = (onSwipeBack: () => void) => (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (touchStartX.current < 50 && diff > 100) {
      onSwipeBack();
    }
    touchStartX.current = null;
  };
  
  // Cycle loading messages
  useEffect(() => {
    if (stage !== 'loading') return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = () => {
    try {
      const stored = localStorage.getItem('mango-profile');
      if (stored) setProfile(JSON.parse(stored));
    } catch (err) { console.log('No existing profile'); }
    setLoading(false);
  };

  const saveProfile = (newProfile: Profile) => {
    try {
      localStorage.setItem('mango-profile', JSON.stringify(newProfile));
      setProfile(newProfile);
      setEditingProfile(false);
    } catch (err) { console.error('Failed to save profile:', err); }
  };

  const markAsWatched = async (movie: Movie) => {
    if (!profile) return;
    const movieStr = `${movie.title} (${movie.year})`;
    const updatedWatched = [movieStr, ...profile.recentlyWatched.filter(m => m !== movieStr)].slice(0, 20);
    saveProfile({ ...profile, recentlyWatched: updatedWatched });
  };

  const startQuiz = useCallback(() => {
    setQuestions(shuffleArray(QUESTION_POOL).slice(0, 5));
    setCurrentQuestion(0);
    setAnswers({});
    setStage('questions');
    setError(null);
    sessionContext.current = { moodProfile: null, excludedMovies: [] };
  }, []);

  const handleAnswer = useCallback((questionId: string, option: { value: string; label: string }) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
    else getRecommendations(newAnswers);
  }, [answers, currentQuestion, questions]);

  const getRecommendations = async (finalAnswers: Record<string, { value: string; label: string }>) => {
    setStage('loading');
    setError(null);
    const moodProfile = questions.map(q => ({ question: q.question, answer: finalAnswers[q.id]?.label || 'Not answered' }));
    sessionContext.current.moodProfile = moodProfile;
    sessionContext.current.excludedMovies = [];

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, moodProfile, excludedMovies: [] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      sessionContext.current.excludedMovies = data.recommendations.map((m: Movie) => `${m.title} (${m.year})`);
      setRecommendations(data);
      setStage('results');
    } catch (err) {
      console.error('Recommendation error:', err);
      setError('Failed to get recommendations. Please try again.');
      setStage('intro');
    }
  };

  const handleSeenIt = async (movie: Movie, index: number) => {
    setSwappingIndex(index);
    await markAsWatched(movie);
    const movieStr = `${movie.title} (${movie.year})`;
    if (!sessionContext.current.excludedMovies.includes(movieStr)) sessionContext.current.excludedMovies.push(movieStr);

    try {
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, moodProfile: sessionContext.current.moodProfile, excludedMovies: sessionContext.current.excludedMovies, seenMovie: movie })
      });
      const newMovie = await response.json();
      if (newMovie.error) throw new Error(newMovie.error);
      sessionContext.current.excludedMovies.push(`${newMovie.title} (${newMovie.year})`);
      setRecommendations(prev => prev ? { ...prev, recommendations: prev.recommendations.map((m, i) => i === index ? newMovie : m) } : null);
    } catch (err) {
      setRecommendations(prev => prev ? { ...prev, recommendations: prev.recommendations.filter((_, i) => i !== index) } : null);
    }
    setSwappingIndex(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 flex items-center justify-center">
      <div className="text-center"><div className="animate-bounce text-6xl mb-4">🥭</div><div className="text-white text-xl">Loading...</div></div>
    </div>
  );

  if (!profile || editingProfile) return <ProfileSetup onComplete={saveProfile} existingProfile={editingProfile ? profile : null} />;
  if (selectedMovie) return <MovieDetailModal movie={selectedMovie} profile={profile} onClose={() => setSelectedMovie(null)} onMarkWatched={markAsWatched} />;

  if (stage === 'intro') return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900">
      {/* Top bar with profile icon */}
      <div className="flex justify-end p-4 pt-14">
        <button 
          onClick={() => setEditingProfile(true)} 
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-amber-200 hover:bg-white/20 hover:text-white transition-all"
        >
          <User size={20} />
        </button>
      </div>
      
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🥭🎬🌴</div>
            <h1 className="text-5xl font-bold text-white mb-2">Mango</h1>
            <p className="text-amber-200 text-lg">{profile.name ? `Hey ${profile.name}! ` : ''}Grab your dried mango, let&apos;s find your flick.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6 border border-amber-500/30">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-semibold">Your Profile</h2>
              <button onClick={() => setEditingProfile(true)} className="text-amber-300 hover:text-white text-sm">Edit ✏️</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-amber-300">Type:</span><span className="text-white">{VIEWER_TYPES.find(t => t.id === profile.viewerType)?.label}</span></div>
              <div className="flex justify-between"><span className="text-amber-300">Love:</span><span className="text-green-400">{profile.lovedGenres.slice(0, 3).join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-amber-300">Streaming:</span><span className="text-white">{profile.streamingServices.length} services</span></div>
              {profile.recentlyWatched.filter(m => m.trim()).length > 0 && (
                <div className="flex justify-between"><span className="text-amber-300">Seen:</span><span className="text-orange-300">{profile.recentlyWatched.filter(m => m.trim()).length} movies tracked</span></div>
              )}
            </div>
          </div>
          <button onClick={startQuiz} className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 text-white font-bold text-xl rounded-xl hover:from-yellow-500 hover:via-orange-600 hover:to-amber-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/30">
            🥭 What&apos;s Your Mood Tonight? →
          </button>
          {error && <div className="mt-4 bg-red-500/20 border border-red-400 rounded-xl p-4 text-red-200 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );

  if (stage === 'questions') {
    const q = questions[currentQuestion];
    
    const goBack = () => {
      if (currentQuestion === 0) {
        setStage('intro');
      } else {
        const prevQuestion = questions[currentQuestion - 1];
        const newAnswers = { ...answers };
        delete newAnswers[prevQuestion.id];
        setAnswers(newAnswers);
        setCurrentQuestion(currentQuestion - 1);
      }
    };
    
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeEnd(goBack)}
      >
        {/* Top bar with back button */}
        <div className="flex justify-start p-4 pt-14">
          <button 
            onClick={goBack}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-amber-200 hover:bg-white/20 hover:text-white transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        
        <div className="flex items-center justify-center px-4 pb-8">
          <div className="max-w-lg w-full">
            <div className="mb-8">
              <div className="flex justify-between text-amber-200 text-sm mb-2"><span>Question {currentQuestion + 1} of {questions.length}</span><span>🥭</span></div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-amber-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">{q.question}</h2>
              <div className="space-y-3">
                {q.options.map(option => (
                  <button key={option.value} onClick={() => handleAnswer(q.id, option)}
                    className="w-full p-4 bg-white/5 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20 border border-white/10 hover:border-amber-400 rounded-xl text-left text-white transition-all">
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'loading') return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🥭</div>
        <h2 className="text-2xl font-bold text-white mb-2">{loadingMessage}</h2>
        <p className="text-amber-200">Hang tight</p>
      </div>
    </div>
  );

  if (stage === 'results' && recommendations) return (
    <div 
      className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900"
      onTouchStart={handleTouchStart}
      onTouchEnd={createSwipeEnd(() => setStage('intro'))}
    >
      {/* Top bar with back button */}
      <div className="flex justify-start p-4 pt-14">
        <button 
          onClick={() => setStage('intro')}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-amber-200 hover:bg-white/20 hover:text-white transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🥭🎬🥭</div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Fresh Picks</h1>
            <p className="text-amber-200 italic">&quot;{recommendations.moodSummary}&quot;</p>
          </div>
          <div className="space-y-4 mb-8">
            {recommendations.recommendations?.map((movie, index) => (
              <MovieCard key={`${movie.title}-${movie.year}-${index}`} movie={movie} index={index} onSelect={setSelectedMovie} onSeenIt={handleSeenIt} isSwapping={swappingIndex === index} />
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={startQuiz} className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-amber-500/30 flex items-center justify-center gap-2">
              <RefreshCw size={20} /> Refresh
            </button>
            <button onClick={() => setStage('enjoy')} className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
              <Check size={20} /> Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (stage === 'enjoy') return (
    <div 
      className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 flex items-center justify-center p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={createSwipeEnd(() => setStage('intro'))}
    >
      <div className="text-center">
        <div className="text-8xl mb-6">🥭🍿</div>
        <h1 className="text-4xl font-bold text-white mb-4">Enjoy your movie!</h1>
        <p className="text-amber-200 text-lg mb-8">Grab that dried mango and settle in.</p>
        <button 
          onClick={() => setStage('intro')} 
          className="px-8 py-3 bg-white/10 text-amber-200 rounded-xl hover:bg-white/20 border border-amber-500/30 flex items-center justify-center gap-2 mx-auto"
        >
          <Home size={18} /> Back to Home
        </button>
      </div>
    </div>
  );

  return null;
}