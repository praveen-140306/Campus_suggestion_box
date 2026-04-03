import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Suggestion } from '../types';
import { getSuggestions, deleteSuggestion, updateSuggestionStatus, updateSuggestionReply } from '../services/storage';

const Admin: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isSavingReply, setIsSavingReply] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'personal'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await getSuggestions();
      setSuggestions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this suggestion?')) {
      await deleteSuggestion(id);
      fetchSuggestions();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setSuggestions(suggestions.map(s => 
        s._id === id ? { ...s, status: newStatus as any } : s
      ));
      await updateSuggestionStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchSuggestions();
    }
  };

  const handleReplyChange = (id: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveReply = async (id: string) => {
    const replyText = replyInputs[id];
    if (replyText === undefined) return; 

    setIsSavingReply(prev => ({ ...prev, [id]: true }));
    try {
      setSuggestions(suggestions.map(s => 
        s._id === id ? { ...s, adminReply: replyText } : s
      ));
      await updateSuggestionReply(id, replyText);
    } catch (err) {
      console.error('Failed to save reply:', err);
      fetchSuggestions();
    } finally {
      setIsSavingReply(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-[85vh] relative py-12 px-4 sm:px-6 z-0">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/40 mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-200/40 mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        <div className="flex justify-between items-end pb-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-500 tracking-tight drop-shadow-sm">Admin Dashboard</h1>
            <p className="text-slate-600 font-medium text-lg mt-2">Overview of student feedback and metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl group-hover:bg-blue-200/50 transition-colors duration-500"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Total Suggestions</p>
            <p className="text-6xl font-black text-slate-800 mt-4 relative z-10 tracking-tight">{suggestions.length}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-100/50 rounded-full blur-3xl group-hover:bg-indigo-200/50 transition-colors duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academics</p>
              <div className="h-3.5 w-3.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"></div>
            </div>
            <p className="text-6xl font-black text-slate-800 mt-4 relative z-10 tracking-tight">
              {suggestions.filter(s => s.category === 'Academics').length}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-teal-100/50 rounded-full blur-3xl group-hover:bg-teal-200/50 transition-colors duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facilities</p>
              <div className="h-3.5 w-3.5 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]"></div>
            </div>
            <p className="text-6xl font-black text-slate-800 mt-4 relative z-10 tracking-tight">
              {suggestions.filter(s => s.category === 'Facilities').length}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl group-hover:bg-purple-200/50 transition-colors duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Events</p>
              <div className="h-3.5 w-3.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]"></div>
            </div>
            <p className="text-6xl font-black text-slate-800 mt-4 relative z-10 tracking-tight">
              {suggestions.filter(s => s.category === 'Events').length}
            </p>
          </div>
        </div>

        {/* Visibility Filter Tabs */}
        <div className="flex items-center gap-2">
          {(['all', 'public', 'personal'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? tab === 'personal'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                    : tab === 'public'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-800 text-white shadow-lg shadow-slate-300'
                  : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
              <span className="ml-2 text-xs opacity-80">
                ({tab === 'all'
                  ? suggestions.length
                  : suggestions.filter(s =>
                      tab === 'personal'
                        ? s.visibility === 'personal'
                        : s.visibility !== 'personal'
                    ).length
                })
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-white overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-500 text-sm">Loading data...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-gray-400 font-medium">No suggestions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Student</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Category</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Message</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">Upvotes</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Admin Reply</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestions
                  .filter(s =>
                    activeTab === 'all'
                      ? true
                      : activeTab === 'personal'
                        ? s.visibility === 'personal'
                        : s.visibility !== 'personal'
                  )
                  .map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800">
                      {s.name || <span className="text-slate-400 italic font-medium">Anonymous</span>}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${s.category === 'Academics' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        s.category === 'Facilities' ? 'bg-green-100 text-green-800 border border-green-200' :
                          s.category === 'Events' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                        {s.category}
                      </span>
                      {s.visibility && (
                        <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          s.visibility === 'public' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {s.visibility}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-sm" title={s.message}>
                      <div className="truncate">{s.message}</div>
                      {s.attachmentUrl && (
                         <div className="mt-2">
                            <a href={`${s.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1">
                               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                               View Attachment
                            </a>
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      <div className="flex items-center justify-center gap-1 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-flex">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                        {(s.upvotes || []).length}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <select
                        value={s.status || 'Pending'}
                        onChange={(e) => handleStatusChange(s._id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none ring-1 ring-inset ${
                          s.status === 'Resolved' ? 'bg-green-50 text-green-700 ring-green-200 focus:ring-green-500' :
                          s.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700 ring-yellow-200 focus:ring-yellow-500' :
                          'bg-slate-50 text-slate-700 ring-slate-200 focus:ring-slate-500'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-2 min-w-[240px]">
                        <textarea
                          rows={2}
                          placeholder="Type a reply..."
                          className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                          value={replyInputs[s._id] !== undefined ? replyInputs[s._id] : (s.adminReply || '')}
                          onChange={(e) => handleReplyChange(s._id, e.target.value)}
                        />
                        <button
                          onClick={() => handleSaveReply(s._id)}
                          disabled={isSavingReply[s._id]}
                          className={`px-3 py-2 text-xs font-bold rounded-xl text-white shadow-sm transition-colors ${
                            isSavingReply[s._id] ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {isSavingReply[s._id] ? '...' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Admin;
