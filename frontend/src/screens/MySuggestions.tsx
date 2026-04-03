import React, { useState, useEffect } from 'react';
import { Suggestion } from '../types';
import { getMySuggestions, toggleUpvoteSuggestion } from '../services/storage';

const MySuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchMySuggestions();
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchMySuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await getMySuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching my suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!currentUser) return;

    try {
      // Optimistic URL update
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
      fetchMySuggestions(); // revert
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          My Suggestions
        </h1>
        <p className="mt-2 text-gray-500">
          Track the status of the feedback you've submitted.
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
            <h3 className="text-lg font-medium text-gray-900">No suggestions yet</h3>
            <p className="mt-1 text-gray-500">You haven't submitted any feedback to the campus box.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {suggestions.map((suggestion) => (
              <div key={suggestion._id} className="p-6 transition-colors hover:bg-gray-50 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.category === 'Academics' ? 'bg-blue-100 text-blue-800' :
                        suggestion.category === 'Facilities' ? 'bg-green-100 text-green-800' :
                        suggestion.category === 'Events' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {suggestion.category}
                      </span>
                      {suggestion.visibility && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          suggestion.visibility === 'public' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {suggestion.visibility}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        Submitted on {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 text-lg mb-3">{suggestion.message}</p>
                    
                    {suggestion.attachmentUrl && (
                      <div className="mt-2 border rounded-md overflow-hidden bg-gray-50 inline-block max-w-full">
                        {suggestion.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <a href={`http://localhost:5000${suggestion.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={`http://localhost:5000${suggestion.attachmentUrl}`} 
                              alt="Attached file" 
                              className="max-h-48 object-contain"
                            />
                          </a>
                        ) : (
                          <div className="p-3 flex items-center gap-3">
                            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Attached Document</p>
                                <a href={`http://localhost:5000${suggestion.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Download</a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      suggestion.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                      suggestion.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {suggestion.status || 'Pending'}
                    </span>

                    <button
                      onClick={() => handleUpvote(suggestion._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                        currentUser && (suggestion.upvotes || []).includes(currentUser._id)
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg
                        className={`h-4 w-4 ${currentUser && (suggestion.upvotes || []).includes(currentUser._id) ? 'text-indigo-600' : 'text-gray-400'}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" className="hidden" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{(suggestion.upvotes || []).length}</span>
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

export default MySuggestions;
