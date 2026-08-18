import React, { useState } from 'react';
import { fetchSubredditPosts } from './services/redditService';
import { analyzePostsSentiment } from './services/sentimentService';

export default function App() {
  const [subredditInput, setSubredditInput] = useState('technology');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, neutral: 0 });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!subredditInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const rawPosts = await fetchSubredditPosts(subredditInput.trim());
      const { analyzedPosts, stats: computedStats } = analyzePostsSentiment(rawPosts);
      setPosts(analyzedPosts);
      setStats(computedStats);
    } catch (err) {
      setError(err.message || 'Failed to fetch subreddit data.');
      setPosts([]);
      setStats({ total: 0, positive: 0, negative: 0, neutral: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getDominantVibe = () => {
    if (stats.total === 0) return { label: 'Awaiting Search', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    if (stats.positive >= stats.negative && stats.positive >= stats.neutral) {
      return { label: '🟢 Positive Vibe', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (stats.negative > stats.positive && stats.negative >= stats.neutral) {
      return { label: '🔴 Negative Vibe', color: 'bg-red-100 text-red-800 border-red-300' };
    } else {
      return { label: '🟡 Neutral Vibe', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
  };

  const vibe = getDominantVibe();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 mb-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            🔥 The Subreddit Vibe Check
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">r/</span>
              <input
                type="text"
                value={subredditInput}
                onChange={(e) => setSubredditInput(e.target.value)}
                placeholder="subreddit"
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Checking...' : 'Check Vibe'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Vibe Overview Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border">
            <span className="text-sm text-gray-500 mb-1">Overall Community Vibe</span>
            <span className={`text-xl font-bold px-4 py-2 rounded-full border ${vibe.color}`}>
              {vibe.label}
            </span>
          </div>
          <div className="md:col-span-2 grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-700">{stats.positive}</div>
              <div className="text-xs text-green-600 font-medium uppercase tracking-wider mt-1">Positive</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-700">{stats.neutral}</div>
              <div className="text-xs text-yellow-600 font-medium uppercase tracking-wider mt-1">Neutral</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-700">{stats.negative}</div>
              <div className="text-xs text-red-600 font-medium uppercase tracking-wider mt-1">Negative</div>
            </div>
          </div>
        </div>

        {/* Post Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
            <span>Top Hot Posts ({posts.length})</span>
            <span className="text-xs text-gray-400 font-normal">Analyzed via client-side AFINN lexicon</span>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-gray-500">Analyzing subreddit posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No posts loaded yet. Search for a subreddit above!</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map((post) => {
                const badgeColor = 
                  post.sentimentType === 'Positive' ? 'bg-green-100 text-green-800' :
                  post.sentimentType === 'Negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';

                return (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <a 
                        href={post.permalink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-orange-600 transition text-lg"
                      >
                        {post.title}
                      </a>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>Posted by u/{post.author}</span>
                        <span>•</span>
                        <span>⬆ {post.score} upvotes</span>
                        <span>•</span>
                        <span>💬 {post.numComments} comments</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>
                      {post.sentimentType} ({post.sentimentScore})
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}