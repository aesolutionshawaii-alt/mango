'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, ChevronLeft, RefreshCw, Check, Home, Heart, List, X } from 'lucide-react';

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
  streamingOptions?: StreamingOption[];
}

interface StreamingOption {
  service: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  price?: string;
  link: string;
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
    <div className={`p-4 rounded-2xl ${isExternal ? 'bg-amber-50 border border-amber-200' : 'bg-orange-50 border border-orange-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-gray-800">{review.author}</span>
          {review.source && (
            <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded">{review.source}</span>
          )}
        </div>
        <MangoRating rating={review.rating} readonly size="small" />
      </div>
      <p className="text-gray-600 text-sm">{review.text}</p>
      {review.date && <p className="text-gray-400 text-xs mt-2">{review.date}</p>}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-orange-200/50 border border-orange-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Review {movie.title}</h2>
        <p className="text-gray-500 text-sm mb-4">Share your thoughts with the community</p>
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Your Rating</label>
          <MangoRating rating={rating} onRate={setRating} />
        </div>
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Your Review (optional)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think?"
            rows={4}
            className="w-full p-3 bg-orange-50/50 border border-orange-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-medium">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 font-medium"
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl shadow-orange-200/50 border border-orange-100">
        <div className="p-6 border-b border-orange-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{movie.title}</h2>
              <div className="flex gap-3 mt-2 text-sm flex-wrap">
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{movie.year}</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{movie.streaming}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{movie.genre}</span>
                <span className="text-gray-500">{movie.runtime}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
          </div>
          
          {movie.director && (
            <div className="mt-4">
              <span className="text-orange-500 text-sm">Directed by </span>
              <span className="text-gray-800 font-medium">{movie.director}</span>
            </div>
          )}
          
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-3">
              <span className="text-orange-500 text-sm block mb-2">Starring</span>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, idx) => (
                  <span key={idx} className="bg-orange-50 text-gray-700 px-3 py-1 rounded-full text-sm">🎭 {actor}</span>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mt-4">{movie.pitch}</p>
          
          <div className="flex gap-4 mt-4 flex-wrap">
            {externalReviews.rtScore && (
              <div className="bg-red-50 px-3 py-1 rounded-lg">
                <span className="text-red-500 font-bold">🍅 {externalReviews.rtScore}</span>
              </div>
            )}
            {externalReviews.imdbScore && (
              <div className="bg-amber-50 px-3 py-1 rounded-lg">
                <span className="text-amber-600 font-bold">⭐ {externalReviews.imdbScore}</span>
              </div>
            )}
            {communityAvgRating && (
              <div className="bg-orange-50 px-3 py-1 rounded-lg">
                <span className="text-orange-500 font-bold">🥭 {communityAvgRating}/5</span>
                <span className="text-orange-400 text-sm ml-1">({communityReviews.length})</span>
              </div>
            )}
            <div className="bg-emerald-50 px-3 py-1 rounded-lg">
              <span className="text-emerald-500 font-bold">🎯 {movie.vibeMatch}%</span>
            </div>
          </div>

          {externalReviews.consensus && (
            <p className="text-gray-500 italic mt-4 text-sm border-l-2 border-orange-300 pl-3">{externalReviews.consensus}</p>
          )}
        </div>

        <div className="flex border-b border-orange-100">
          <button
            onClick={() => setActiveTab('external')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'external' ? 'text-orange-600 border-b-2 border-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
          >
            🎬 Critics & Press
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'community' ? 'text-orange-600 border-b-2 border-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
          >
            🥭 Community ({communityReviews.length})
          </button>
        </div>

        <div className="p-6">
          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="animate-bounce text-4xl mb-2">🥭</div>
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : activeTab === 'external' ? (
            <div className="space-y-3">
              {externalReviews.reviews?.length > 0 ? (
                externalReviews.reviews.map((review, idx) => <ReviewCard key={idx} review={review} isExternal />)
              ) : (
                <p className="text-gray-400 text-center py-4">No external reviews found</p>
              )}
            </div>
          ) : (
            <div>
              <button onClick={() => setShowWriteReview(true)} className="w-full py-3 mb-4 bg-orange-50 border border-orange-200 text-orange-600 rounded-2xl hover:bg-orange-100 font-medium">
                ✍️ Write a Review
              </button>
              <div className="space-y-3">
                {communityReviews.length > 0 ? (
                  communityReviews.slice().reverse().map((review, idx) => <ReviewCard key={idx} review={review} />)
                ) : (
                  <p className="text-gray-400 text-center py-4">No community reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-orange-100 flex gap-3">
          <button onClick={() => { onMarkWatched(movie); onClose(); }} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 font-medium">✓ Mark as Watched</button>
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-medium">Close</button>
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
    <div className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative max-w-lg w-full">
        <div className="mb-6">
          <div className="flex justify-between text-gray-500 text-sm mb-2">
            <span>Profile Setup</span>
            <span>Step {step} of {totalSteps}</span>
          </div>
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl shadow-orange-100/50 border border-orange-100">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🥭 Let&apos;s get to know you</h2>
              <div className="mb-6">
                <label className="block text-gray-600 mb-2">What should we call you?</label>
                <input type="text" value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} placeholder="Your name"
                  className="w-full p-3 bg-orange-50/50 border border-orange-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-gray-600 mb-3">What kind of movie watcher are you?</label>
                <div className="space-y-2">
                  {VIEWER_TYPES.map(type => (
                    <button key={type.id} onClick={() => updateProfile('viewerType', type.id)}
                      className={`w-full p-4 rounded-2xl text-left transition-all ${profile.viewerType === type.id ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400' : 'bg-orange-50/50 border-orange-100 hover:bg-orange-100 text-gray-700'} border`}>
                      <div className={`font-medium ${profile.viewerType === type.id ? 'text-white' : 'text-gray-800'}`}>{type.label}</div>
                      <div className={`text-sm ${profile.viewerType === type.id ? 'text-orange-100' : 'text-gray-500'}`}>{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Genres you love 🌴</h2>
              <p className="text-gray-500 mb-6">Pick your favorites (at least 2)</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button key={genre} onClick={() => toggleArrayItem('lovedGenres', genre)} disabled={profile.hatedGenres.includes(genre)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${profile.lovedGenres.includes(genre) ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : profile.hatedGenres.includes(genre) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-orange-50 text-gray-600 hover:bg-orange-100'}`}>
                    {profile.lovedGenres.includes(genre) && '🥭 '}{genre}
                  </button>
                ))}
              </div>
              {profile.lovedGenres.length > 0 && <p className="text-emerald-600 mt-4">🥭 {profile.lovedGenres.join(', ')}</p>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Genres to avoid 🚫</h2>
              <p className="text-gray-500 mb-6">What do you never want recommended?</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button key={genre} onClick={() => toggleArrayItem('hatedGenres', genre)} disabled={profile.lovedGenres.includes(genre)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${profile.hatedGenres.includes(genre) ? 'bg-red-500 text-white' : profile.lovedGenres.includes(genre) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-orange-50 text-gray-600 hover:bg-orange-100'}`}>
                    {profile.hatedGenres.includes(genre) && '🚫 '}{genre}
                  </button>
                ))}
              </div>
              {profile.hatedGenres.length > 0 && <p className="text-red-500 mt-4">🚫 {profile.hatedGenres.join(', ')}</p>}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Some favorites 🎬</h2>
              <p className="text-gray-500 mb-6">Name a few movies you love</p>
              <div className="space-y-3">
                {profile.favoriteMovies.map((movie, index) => (
                  <input key={index} type="text" value={movie} onChange={(e) => updateArrayIndex('favoriteMovies', index, e.target.value)} placeholder={`Favorite movie ${index + 1}`}
                    className="w-full p-3 bg-orange-50/50 border border-orange-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400" />
                ))}
              </div>
              <button onClick={() => updateProfile('favoriteMovies', [...profile.favoriteMovies, ''])} className="mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium">+ Add another</button>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hard limits 🛑</h2>
              <p className="text-gray-500 mb-6">Anything we should never recommend?</p>
              <div className="space-y-2">
                {HARD_LIMITS.map(limit => (
                  <button key={limit.id} onClick={() => toggleArrayItem('hardLimits', limit.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${profile.hardLimits.includes(limit.id) ? 'bg-red-50 border-red-300' : 'bg-orange-50/50 border-orange-100 hover:bg-orange-100'} border`}>
                    <span className="text-xl">{profile.hardLimits.includes(limit.id) ? '🚫' : '⬜'}</span>
                    <span className={profile.hardLimits.includes(limit.id) ? 'text-red-600' : 'text-gray-700'}>{limit.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your streaming services 📺</h2>
              <p className="text-gray-500 mb-6">What do you have access to?</p>
              <div className="flex flex-wrap gap-2">
                {STREAMING_SERVICES.map(service => (
                  <button key={service} onClick={() => toggleArrayItem('streamingServices', service)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${profile.streamingServices.includes(service) ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-orange-50 text-gray-600 hover:bg-orange-100'}`}>
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-6 py-2 text-orange-500 hover:text-orange-600 disabled:opacity-30 font-medium">← Back</button>
            {step < totalSteps ? (
              <button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !profile.viewerType) || (step === 2 && profile.lovedGenres.length < 2)}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 font-medium">Next →</button>
            ) : (
              <button onClick={() => onComplete(profile)} disabled={profile.streamingServices.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-300/50">Save Profile 🥭</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Watchlist Modal Component
function WatchlistModal({ 
  watchlist, 
  onClose, 
  onRemove, 
  onSelectMovie,
  onMarkWatched 
}: { 
  watchlist: Movie[]; 
  onClose: () => void; 
  onRemove: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  onMarkWatched: (movie: Movie) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-orange-100 flex justify-between items-center sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-pink-500" fill="currentColor" />
            <h2 className="text-xl font-bold text-gray-800">Watchlist ({watchlist.length})</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          {watchlist.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💔</div>
              <p className="text-gray-500">Your watchlist is empty</p>
              <p className="text-gray-400 text-sm">Tap the heart on any movie to save it for later</p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((movie, idx) => (
                <div key={`${movie.title}-${movie.year}-${idx}`} className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => { onSelectMovie(movie); onClose(); }}>
                      <h3 className="font-bold text-gray-800 cursor-pointer hover:text-orange-600">{movie.title}</h3>
                      <div className="flex gap-2 text-xs mt-1">
                        <span className="text-amber-600">{movie.year}</span>
                        <span className="text-gray-500">{movie.genre}</span>
                        <span className="text-gray-400">{movie.runtime}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{movie.pitch}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button 
                        onClick={() => { onMarkWatched(movie); onRemove(movie); }}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-full"
                        title="Mark as watched"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => onRemove(movie)}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-full"
                        title="Remove from watchlist"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Movie Card Component
function MovieCard({ 
  movie, 
  index, 
  onSelect, 
  onSeenIt, 
  isSwapping,
  isInWatchlist,
  onToggleWatchlist,
}: { 
  movie: Movie; 
  index: number; 
  onSelect: (movie: Movie) => void; 
  onSeenIt: (movie: Movie, index: number) => void; 
  isSwapping: boolean;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}) {
  const [streamingOptions, setStreamingOptions] = useState<StreamingOption[]>([]);
  const [loadingStreaming, setLoadingStreaming] = useState(true);

  useEffect(() => {
    const fetchStreaming = async () => {
      setLoadingStreaming(true);
      try {
        const response = await fetch('/api/streaming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: movie.title, year: movie.year })
        });
        const data = await response.json();
        setStreamingOptions(data.streamingOptions || []);
      } catch (err) {
        console.error('Failed to fetch streaming:', err);
      }
      setLoadingStreaming(false);
    };
    fetchStreaming();
  }, [movie.title, movie.year]);

  const getStreamingIcon = (type: string) => {
    switch (type) {
      case 'subscription': return '✅';
      case 'free': return '🆓';
      case 'rent': return '💵';
      case 'buy': return '🛒';
      default: return '📺';
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-lg shadow-orange-100/50 border border-orange-100 hover:shadow-xl hover:shadow-orange-200/50 transition-all ${isSwapping ? 'opacity-50 animate-pulse' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <h3 className="text-xl font-bold text-gray-800">{index + 1}. {movie.title}</h3>
            <button 
              onClick={() => onToggleWatchlist(movie)}
              className={`p-1.5 rounded-full transition-all ${isInWatchlist ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-400 hover:bg-pink-50 hover:text-pink-400'}`}
            >
              <Heart size={16} fill={isInWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap text-sm mt-1">
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{movie.year}</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{movie.genre}</span>
            <span className="text-gray-500">{movie.runtime}</span>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-emerald-500">{movie.vibeMatch}%</div>
          <div className="text-xs text-gray-400">match</div>
        </div>
      </div>
      
      {/* Streaming Options */}
      <div className="mt-3 mb-3">
        {loadingStreaming ? (
          <div className="text-xs text-gray-400">Loading streaming info...</div>
        ) : streamingOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {streamingOptions.slice(0, 4).map((opt, idx) => (
              <a 
                key={idx}
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-all hover:scale-105 ${
                  opt.type === 'subscription' ? 'bg-emerald-100 text-emerald-700' :
                  opt.type === 'free' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}
              >
                {getStreamingIcon(opt.type)} {opt.service}
                {opt.price && <span className="font-medium">{opt.price}</span>}
              </a>
            ))}
            {streamingOptions.length > 4 && (
              <span className="text-xs text-gray-400">+{streamingOptions.length - 4} more</span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400">Streaming info unavailable</div>
        )}
      </div>

      {movie.director && (<div className="mt-2"><span className="text-orange-500 text-sm">Dir: </span><span className="text-gray-700 text-sm">{movie.director}</span></div>)}
      {movie.cast && movie.cast.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {movie.cast.slice(0, 3).map((actor, idx) => (<span key={idx} className="bg-orange-50 text-gray-600 px-2 py-0.5 rounded text-xs">{actor}</span>))}
          {movie.cast.length > 3 && <span className="text-orange-400 text-xs">+{movie.cast.length - 3} more</span>}
        </div>
      )}
      <p className="text-gray-600 mt-3">{movie.pitch}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => onSelect(movie)} className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 text-sm font-medium">📖 Details</button>
        <button onClick={() => onSeenIt(movie, index)} disabled={isSwapping} className="py-2 px-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 text-sm font-medium disabled:opacity-50">{isSwapping ? '🔄' : '👁️ Seen It'}</button>
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
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
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
      const storedWatchlist = localStorage.getItem('mango-watchlist');
      if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
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
    // Also remove from watchlist if present
    removeFromWatchlist(movie);
  };

  const isInWatchlist = (movie: Movie) => {
    return watchlist.some(m => m.title === movie.title && m.year === movie.year);
  };

  const toggleWatchlist = (movie: Movie) => {
    let newWatchlist: Movie[];
    if (isInWatchlist(movie)) {
      newWatchlist = watchlist.filter(m => !(m.title === movie.title && m.year === movie.year));
    } else {
      newWatchlist = [...watchlist, movie];
    }
    setWatchlist(newWatchlist);
    localStorage.setItem('mango-watchlist', JSON.stringify(newWatchlist));
  };

  const removeFromWatchlist = (movie: Movie) => {
    const newWatchlist = watchlist.filter(m => !(m.title === movie.title && m.year === movie.year));
    setWatchlist(newWatchlist);
    localStorage.setItem('mango-watchlist', JSON.stringify(newWatchlist));
  };

  const fetchStreamingInfo = async (movie: Movie): Promise<StreamingOption[]> => {
    try {
      const response = await fetch('/api/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: movie.title, year: movie.year })
      });
      const data = await response.json();
      return data.streamingOptions || [];
    } catch (err) {
      console.error('Failed to fetch streaming info:', err);
      return [];
    }
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
    <div className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
      <div className="text-center"><div className="animate-bounce text-6xl mb-4">🥭</div><div className="text-gray-600 text-xl">Loading...</div></div>
    </div>
  );

  if (!profile || editingProfile) return <ProfileSetup onComplete={saveProfile} existingProfile={editingProfile ? profile : null} />;
  if (selectedMovie) return <MovieDetailModal movie={selectedMovie} profile={profile} onClose={() => setSelectedMovie(null)} onMarkWatched={markAsWatched} />;
  
  // Render watchlist modal as overlay
  const watchlistModal = showWatchlist ? (
    <WatchlistModal 
      watchlist={watchlist} 
      onClose={() => setShowWatchlist(false)} 
      onRemove={removeFromWatchlist}
      onSelectMovie={setSelectedMovie}
      onMarkWatched={markAsWatched}
    />
  ) : null;

  if (stage === 'intro') return (
    <>
      {watchlistModal}
    <div className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-amber-100/40 to-orange-100/40 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      
      {/* Top bar with watchlist and profile icons */}
      <div className="relative flex justify-between items-center p-4 pt-16">
        {watchlist.length > 0 ? (
          <button 
            onClick={() => setShowWatchlist(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 shadow-lg rounded-full text-pink-500 hover:bg-white transition-all"
          >
            <Heart size={18} fill="currentColor" />
            <span className="font-medium">{watchlist.length}</span>
          </button>
        ) : (
          <div /> 
        )}
        <button 
          onClick={() => setEditingProfile(true)} 
          className="w-10 h-10 bg-white/80 shadow-lg rounded-full flex items-center justify-center text-orange-500 hover:bg-white hover:text-orange-600 transition-all"
        >
          <User size={20} />
        </button>
      </div>
      
      <div className="relative flex items-center justify-center px-4 pb-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🥭🎬🌴</div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Mango</h1>
            <p className="text-gray-500 text-lg">{profile.name ? `Hey ${profile.name}! ` : ''}Grab your dried mango, let&apos;s find your flick.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 mb-6 shadow-xl shadow-orange-100/50 border border-orange-100">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-gray-800 font-semibold">Your Profile</h2>
              <button onClick={() => setEditingProfile(true)} className="text-orange-500 hover:text-orange-600 text-sm font-medium">Edit ✏️</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="text-gray-800">{VIEWER_TYPES.find(t => t.id === profile.viewerType)?.label}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Love:</span><span className="text-emerald-600">{profile.lovedGenres.slice(0, 3).join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Streaming:</span><span className="text-gray-800">{profile.streamingServices.length} services</span></div>
              {profile.recentlyWatched.filter(m => m.trim()).length > 0 && (
                <div className="flex justify-between"><span className="text-gray-500">Seen:</span><span className="text-orange-500">{profile.recentlyWatched.filter(m => m.trim()).length} movies tracked</span></div>
              )}
            </div>
          </div>
          <button onClick={startQuiz} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xl rounded-3xl hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-300/50">
            🥭 What&apos;s Your Mood Tonight? →
          </button>
          {error && <div className="mt-4 bg-red-50 border border-red-200 rounded-3xl p-4 text-red-600 text-center">{error}</div>}
        </div>
      </div>
    </div>
    </>
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
        className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeEnd(goBack)}
      >
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-200/40 to-orange-200/40 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
        
        {/* Top bar with back button */}
        <div className="relative flex justify-start p-4 pt-16">
          <button 
            onClick={goBack}
            className="w-10 h-10 bg-white/80 shadow-lg rounded-full flex items-center justify-center text-orange-500 hover:bg-white hover:text-orange-600 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        
        <div className="relative flex items-center justify-center px-4 pb-8">
          <div className="max-w-lg w-full">
            <div className="mb-8">
              <div className="flex justify-between text-gray-500 text-sm mb-2"><span>Question {currentQuestion + 1} of {questions.length}</span><span>🥭</span></div>
              <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl shadow-orange-100/50 border border-orange-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{q.question}</h2>
              <div className="space-y-3">
                {q.options.map(option => (
                  <button key={option.value} onClick={() => handleAnswer(q.id, option)}
                    className="w-full p-4 bg-orange-50/50 hover:bg-orange-100 border border-orange-100 hover:border-orange-300 rounded-2xl text-left text-gray-700 transition-all">
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
    <div className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative text-center">
        <div className="text-6xl mb-4 animate-bounce">🥭</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{loadingMessage}</h2>
        <p className="text-gray-500">Hang tight</p>
      </div>
    </div>
  );

  if (stage === 'results' && recommendations) return (
    <>
      {watchlistModal}
      <div 
        className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={createSwipeEnd(() => setStage('intro'))}
      >
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full blur-3xl -translate-x-1/2" />
      
      {/* Top bar with back button and watchlist */}
      <div className="relative flex justify-between items-center p-4 pt-16">
        <button 
          onClick={() => setStage('intro')}
          className="w-10 h-10 bg-white/80 shadow-lg rounded-full flex items-center justify-center text-orange-500 hover:bg-white hover:text-orange-600 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        {watchlist.length > 0 && (
          <button 
            onClick={() => setShowWatchlist(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 shadow-lg rounded-full text-pink-500 hover:bg-white transition-all"
          >
            <Heart size={18} fill="currentColor" />
            <span className="font-medium">{watchlist.length}</span>
          </button>
        )}
      </div>
      
      <div className="relative px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🥭🎬🥭</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Fresh Picks</h1>
            <p className="text-gray-500 italic">&quot;{recommendations.moodSummary}&quot;</p>
          </div>
          <div className="space-y-4 mb-8">
            {recommendations.recommendations?.map((movie, index) => (
              <MovieCard 
                key={`${movie.title}-${movie.year}-${index}`} 
                movie={movie} 
                index={index} 
                onSelect={setSelectedMovie} 
                onSeenIt={handleSeenIt} 
                isSwapping={swappingIndex === index}
                isInWatchlist={isInWatchlist(movie)}
                onToggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={startQuiz} className="flex-1 py-4 bg-white/80 text-gray-700 font-bold rounded-3xl hover:bg-white shadow-lg shadow-orange-100/50 border border-orange-100 flex items-center justify-center gap-2">
              <RefreshCw size={20} /> Refresh
            </button>
            <button onClick={() => setStage('enjoy')} className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-3xl shadow-lg shadow-orange-300/50 flex items-center justify-center gap-2">
              <Check size={20} /> Done
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );

  if (stage === 'enjoy') return (
    <div 
      className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={createSwipeEnd(() => setStage('intro'))}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative text-center">
        <div className="text-8xl mb-6">🥭🍿</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Enjoy your movie!</h1>
        <p className="text-gray-500 text-lg mb-8">Grab that dried mango and settle in.</p>
        <button 
          onClick={() => setStage('intro')} 
          className="px-8 py-3 bg-white/80 text-gray-700 rounded-3xl hover:bg-white shadow-lg shadow-orange-100/50 border border-orange-100 flex items-center justify-center gap-2 mx-auto"
        >
          <Home size={18} /> Back to Home
        </button>
      </div>
    </div>
  );

  return null;
}