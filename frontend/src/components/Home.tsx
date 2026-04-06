import React, { useState, useEffect } from 'react';
import { Category, Suggestion } from '../types';
import { addSuggestion, getPublicSuggestions, toggleUpvoteSuggestion } from '../services/storage';

const Home: React.FC = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Academics');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'personal'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'feed'>('submit');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchSuggestions();
    }
  }, [activeTab]);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const data = await getPublicSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await addSuggestion(name, category, message, attachment, visibility);
      setShowSuccess(true);
      setName('');
      setCategory('Academics');
      setMessage('');
      setAttachment(null);
      setVisibility('public');

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      setSubmitError(error?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!currentUser) {
      alert('Please log in to upvote suggestions.');
      return;
    }
    try {
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
      fetchSuggestions();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Campus Suggestion Box
        </h1>
        <p className="mt-4 text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
          Share your feedback to help improve our college experience. Your voice matters.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-center mb-10">
        <div className="inline-flex bg-slate-100 rounded-2xl p-1.5 gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'submit'
                ? 'bg-white text-indigo-700 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit Suggestion
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'feed'
                ? 'bg-white text-indigo-700 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            All Suggestions
          </button>
        </div>
      </div>

      {/* Submit Tab */}
      {activeTab === 'submit' && (
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
            <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium text-sm">Thank you! Your suggestion has been submitted successfully.</span>
          </div>
        )}

        {submitError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <svg className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium text-sm">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-gray-900"
              >
                <option value="Academics">Academics</option>
                <option value="Facilities">Facilities</option>
                <option value="Events">Events</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suggestion Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your suggestion..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

            <div className="relative group">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label 
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600">
                    {attachment ? attachment.name : 'Tap to upload image or file'}
                  </span>
                </div>
              </label>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggestion Visibility
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Public <span className="text-gray-400">(Visible to all students)</span></span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={visibility === 'personal'}
                  onChange={() => setVisibility('personal')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Personal <span className="text-gray-400">(Only visible to Admins)</span></span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-[1.25rem] text-white font-bold shadow-xl shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-3 ${isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Submit Suggestion
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* All Suggestions Tab */}
      {activeTab === 'feed' && (
      <div>
        {isLoadingSuggestions ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 font-medium">No public suggestions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div key={s._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.category === 'Academics' ? 'bg-blue-100 text-blue-800' :
                        s.category === 'Facilities' ? 'bg-green-100 text-green-800' :
                        s.category === 'Events' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {s.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' :
                        s.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {s.status || 'Pending'}
                      </span>
                      <span className="text-sm text-gray-400">
                        by {s.name || 'Anonymous'} · {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-900 text-base">{s.message}</p>

                    {s.attachmentUrl && (
                      <div className="mt-3">
                        {s.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <a href={s.attachmentUrl.startsWith('http') ? s.attachmentUrl : `${s.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                            <img src={s.attachmentUrl.startsWith('http') ? s.attachmentUrl : `${s.attachmentUrl}`} alt="Attachment" className="max-h-48 rounded-lg border object-contain" />
                          </a>
                        ) : (
                          <a href={s.attachmentUrl.startsWith('http') ? s.attachmentUrl : `${s.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            View Attachment
                          </a>
                        )}
                      </div>
                    )}

                    {s.adminReply && (
                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Admin Reply</p>
                        <p className="text-sm text-indigo-900">{s.adminReply}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpvote(s._id)}
                    className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all duration-200 min-w-[60px] ${
                      currentUser && (s.upvotes || []).includes(currentUser._id)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                        : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-sm font-bold">{(s.upvotes || []).length}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default Home;
