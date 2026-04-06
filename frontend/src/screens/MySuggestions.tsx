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
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          My Suggestions
        </h1>
        <p className="mt-3 text-base md:text-lg text-slate-500">
          Track the status of the feedback you've submitted.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden min-h-[400px]">
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
        ) : (
          <div className="divide-y divide-slate-100">
            {suggestions.map((suggestion) => (
              <div key={suggestion._id} className="p-6 sm:p-8 transition-all hover:bg-slate-50 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        suggestion.category === 'Academics' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        suggestion.category === 'Facilities' ? 'bg-green-100 text-green-800 border border-green-200' :
                        suggestion.category === 'Events' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-800 text-lg font-medium leading-relaxed mb-4">{suggestion.message}</p>
                    
                    {suggestion.attachmentUrl && (
                      <div className="mt-2 group">
                        {suggestion.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <a href={suggestion.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative overflow-hidden rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <img 
                              src={suggestion.attachmentUrl} 
                              alt="Attached file" 
                              className="max-h-56 w-full object-contain bg-slate-50 transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                          </a>
                        ) : (
                          <div className="p-4 flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl group-hover:bg-white transition-colors">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Attached Document</p>
                                <a href={suggestion.attachmentUrl.startsWith('http') ? suggestion.attachmentUrl : `${suggestion.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-bold mt-0.5">Download File</a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 self-start">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                      suggestion.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                      suggestion.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      {suggestion.status || 'Pending'}
                    </span>

                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-black text-xs">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{(suggestion.upvotes || []).length}</span>
                    </div>
                  </div>
                </div>
                
                {suggestion.adminReply && (
                  <div className="bg-slate-900 p-5 rounded-[1.5rem] shadow-xl shadow-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full translate-x-16 -translate-y-16 blur-2xl"></div>
                    <div className="relative z-10 flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Official Admin Response</span>
                        <p className="text-slate-100 font-medium leading-relaxed">{suggestion.adminReply}</p>
                      </div>
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
