import React, { useState, useEffect } from 'react';
import { Suggestion } from '../types';
import { getPublicSuggestions, toggleUpvoteSuggestion } from '../services/storage';

const AllSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchSuggestions();
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await getPublicSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching public suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!currentUser) {
      alert('Please log in to upvote suggestions.');
      return;
    }
    try {
      // Optimistic update
      setSuggestions(prev => prev.map(s => {
        if (s._id === id) {
          const upvotes = s.upvotes || [];
          const hasUpvoted = upvotes.includes(currentUser._id);
          const newUpvotes = hasUpvoted
            ? upvotes.filter(uid => uid !== currentUser._id)
            : [...upvotes, currentUser._id];
          return { ...s, upvotes: newUpvotes };
        }
        return s;
      }));
      await toggleUpvoteSuggestion(id);
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
      fetchSuggestions(); // reload on error
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          All Public Suggestions
        </h1>
        <p className="mt-2 text-gray-500">
          Browse suggestions from other students and upvote the ones you agree with.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No public suggestions yet</h3>
            <p className="mt-1 text-gray-500">Be the first to share your thoughts on the campus box!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {suggestions.map((suggestion) => (
              <div key={suggestion._id} className="p-6 transition-colors hover:bg-gray-50 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.category === 'Academics' ? 'bg-blue-100 text-blue-800' :
                        suggestion.category === 'Facilities' ? 'bg-green-100 text-green-800' :
                        suggestion.category === 'Events' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {suggestion.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' :
                        suggestion.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {suggestion.status || 'Pending'}
                      </span>
                      <span className="text-sm text-gray-400">
                        by {suggestion.name || 'Anonymous'} · {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 text-lg mb-3">{suggestion.message}</p>
                    
                    {suggestion.attachmentUrl && (
                      <div className="mt-2 border rounded-md overflow-hidden bg-gray-50 inline-block max-w-full">
                        {suggestion.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <a href={suggestion.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={suggestion.attachmentUrl} 
                              alt="Attached file" 
                              className="max-h-48 w-full object-contain bg-gray-100"
                              onError={(e) => {
                                // If image fails to load (likely old local upload on Vercel), hide it
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </a>
                        ) : (
                          <div className="p-3 flex items-center gap-3">
                            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Attached Document</p>
                                <a href={suggestion.attachmentUrl.startsWith('http') ? suggestion.attachmentUrl : `${suggestion.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Download</a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleUpvote(suggestion._id)}
                      className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all duration-200 min-w-[60px] ${
                        currentUser && (suggestion.upvotes || []).includes(currentUser._id)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                          : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="text-sm font-bold">{(suggestion.upvotes || []).length}</span>
                    </button>
                  </div>
                </div>
                
                {suggestion.adminReply && (
                  <div className="bg-indigo-50 p-4 rounded-md border text-sm border-indigo-100 flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-semibold text-indigo-900 mb-1">Official Admin Response:</span>
                      <p className="text-indigo-800">{suggestion.adminReply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSuggestions;
