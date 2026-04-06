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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-500 tracking-tight drop-shadow-sm">Admin Dashboard</h1>
            <p className="text-slate-600 font-medium text-sm md:text-lg mt-2">Overview of student feedback and metrics</p>
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'public', 'personal'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
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

        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-white overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Recent Suggestions</h2>
            <div className="lg:hidden animate-bounce flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              Mobile Card View 
            </div>
          </div>
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Data...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Engagement</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action Required</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Settings</th>
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
                        {s.name || <span className="text-slate-400 italic">Anonymous</span>}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.category === 'Academics' ? 'bg-blue-100 text-blue-800' :
                          s.category === 'Facilities' ? 'bg-green-100 text-green-800' :
                            s.category === 'Events' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-800'
                          }`}>
                          {s.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-sm">
                        <div className="truncate font-medium">{s.message}</div>
                        {s.attachmentUrl && (
                           <div className="mt-2">
                              <a href={s.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                 Download Attachment
                              </a>
                           </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="bg-slate-100 rounded-lg px-2 py-1 inline-flex items-center gap-1 text-slate-600 font-bold text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                          {(s.upvotes || []).length}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <select
                          value={s.status || 'Pending'}
                          onChange={(e) => handleStatusChange(s._id, e.target.value)}
                          className={`text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-1.5 focus:outline-none ring-1 ring-inset ${
                            s.status === 'Resolved' ? 'bg-green-50 text-green-700 ring-green-200' :
                            s.status === 'Under Review' ? 'bg-yellow-50 text-yellow-700 ring-yellow-200' :
                            'bg-slate-50 text-slate-700 ring-slate-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <textarea
                            rows={1}
                            placeholder="Admin reply..."
                            className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                            value={replyInputs[s._id] !== undefined ? replyInputs[s._id] : (s.adminReply || '')}
                            onChange={(e) => handleReplyChange(s._id, e.target.value)}
                          />
                          <button
                            onClick={() => handleSaveReply(s._id)}
                            disabled={isSavingReply[s._id]}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 4h.01" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {suggestions
                .filter(s =>
                  activeTab === 'all'
                    ? true
                    : activeTab === 'personal'
                      ? s.visibility === 'personal'
                      : s.visibility !== 'personal'
                )
                .map((s) => (
                <div key={s._id} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Student</span>
                      <span className="text-sm font-bold text-slate-800">{s.name || 'Anonymous'}</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.category === 'Academics' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200'}`}>
                      {s.category}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Message</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed mt-1">{s.message}</p>
                  </div>

                  <div className="flex items-center gap-4 py-2 border-t border-b border-slate-200/50">
                    <div className="flex-1">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Status</span>
                      <select
                        value={s.status || 'Pending'}
                        onChange={(e) => handleStatusChange(s._id, e.target.value)}
                        className="w-full text-xs font-black uppercase tracking-widest rounded-xl px-3 py-2 bg-white border border-slate-200"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Votes</span>
                      <span className="text-lg font-black text-indigo-600">{(s.upvotes || []).length}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin Reply</span>
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        placeholder="Type reply..."
                        className="flex-1 text-sm p-3 bg-white border border-slate-200 rounded-2xl resize-none"
                        value={replyInputs[s._id] !== undefined ? replyInputs[s._id] : (s.adminReply || '')}
                        onChange={(e) => handleReplyChange(s._id, e.target.value)}
                      />
                      <button
                        onClick={() => handleSaveReply(s._id)}
                        disabled={isSavingReply[s._id]}
                        className="px-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSavingReply[s._id] ? '...' : 'Save'}
                      </button>
                    </div>
                  </div>

                   <button
                    onClick={() => handleDelete(s._id)}
                    className="w-full py-3 text-rose-500 font-bold text-xs uppercase tracking-widest bg-rose-50 border border-rose-100 rounded-2xl active:scale-95 transition-all"
                  >
                    Delete Suggestion
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default Admin;
