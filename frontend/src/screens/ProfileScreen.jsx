import React, { useEffect, useState } from 'react';

const ProfileScreen = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const infoStr = localStorage.getItem('userInfo');
        if (infoStr) {
            const info = JSON.parse(infoStr);
            setUserInfo(info);
            setNewName(info.name);
            if (info.role === 'student' || info.role === 'admin') {
                fetchStats(info);
            }
        }
    }, []);

    const fetchStats = async (info) => {
        const endpoint = info.role === 'admin' ? '/api/suggestions' : '/api/suggestions/me';
        try {
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${info.token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setStats({
                    total: data.length,
                    pending: data.filter(d => d.status === 'Pending').length,
                    resolved: data.filter(d => d.status === 'Resolved').length
                });
            }
        } catch (e) {
            console.error('Failed to fetch stats for profile', e);
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim() || newName.trim() === userInfo.name) {
            setIsEditingName(false);
            setNewName(userInfo.name);
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({ name: newName })
            });

            const data = await res.json();

            if (res.ok) {
                // Update local storage and state with the new user info
                localStorage.setItem('userInfo', JSON.stringify(data));
                setUserInfo(data);
                setIsEditingName(false);
            } else {
                alert(data.message || 'Failed to update name');
            }
        } catch (e) {
            console.error('Failed to update profile', e);
            alert('An error occurred while updating profile.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!userInfo) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur animate-ping opacity-20"></div>
                    <div className="absolute inset-2 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] relative py-12 px-4 sm:px-6 lg:px-8 z-0">
            {/* Background Blob Decorations */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/50 mix-blend-multiply filter blur-[100px] animate-pulse pointer-events-none"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/50 mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-200/40 mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-10 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 tracking-tight mb-4 drop-shadow-sm px-2">
                        {userInfo.role === 'admin' ? 'Admin Workspace' : 'Student Hub'}
                    </h1>
                    <p className="text-slate-600 font-medium text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-6">
                        Overview of your profile and recent activity across the platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
                         <div className="relative group bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col items-center text-center overflow-hidden">
                            
                            {/* Decorative background for card */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 -z-10"></div>
                            
                            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 mt-4">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-full animate-[spin_8s_linear_infinite] opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-500"></div>
                                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 p-1 flex items-center justify-center shadow-xl">
                                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-500">
                                        {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                            </div>
                            
                            {isEditingName ? (
                                <div className="flex flex-col items-center gap-3 w-full mb-2">
                                    <input 
                                        type="text" 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="text-center text-lg font-bold text-slate-800 bg-slate-50 border-2 border-indigo-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
                                        autoFocus
                                        disabled={isUpdating}
                                    />
                                    <div className="flex gap-2 w-full">
                                        <button 
                                            onClick={() => { setIsEditingName(false); setNewName(userInfo.name); }}
                                            className="flex-1 py-2 px-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                                            disabled={isUpdating}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleUpdateName}
                                            className="flex-1 py-2 px-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 mb-2 group/edit cursor-pointer" onClick={() => setIsEditingName(true)}>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{userInfo.name}</h2>
                                    <div className="opacity-0 group-hover/edit:opacity-100 transition-opacity p-2 rounded-full bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm" title="Edit name">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <p className="text-slate-500 mb-6 font-medium bg-slate-100/50 px-4 py-1.5 rounded-full text-sm">{userInfo.email}</p>
                            
                            <div className="w-full border-t border-slate-200/60 my-4"></div>
                            
                            <div className="flex flex-col w-full gap-3 mt-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Role Access</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-bold text-slate-700 capitalize">
                                        {userInfo.role}
                                    </span>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8 justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            
                            {/* Stat Card 1 */}
                            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden group">
                                <div className="absolute -right-8 -top-8 bg-indigo-50 w-32 h-32 rounded-full transition-transform duration-500 group-hover:scale-150"></div>
                                <div className="absolute top-6 right-6 text-indigo-400/20 group-hover:text-indigo-500/20 transition-colors duration-500">
                                    <svg className="w-16 h-16 sm:w-24 sm:h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-slate-500 font-bold mb-4 uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                        {userInfo.role === 'admin' ? 'Platform Total' : 'My Entries'}
                                    </h3>
                                    <div className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tighter">{stats.total}</div>
                                    <p className="mt-4 text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full">Total Suggestions Recorded</p>
                                </div>
                            </div>
                            
                            {/* Stat Card 2 */}
                            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden group">
                                <div className="absolute -right-8 -top-8 bg-orange-50 w-32 h-32 rounded-full transition-transform duration-500 group-hover:scale-150"></div>
                                <div className="absolute top-6 right-6 text-orange-400/20 group-hover:text-orange-500/20 transition-colors duration-500">
                                    <svg className="w-16 h-16 sm:w-24 sm:h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-slate-500 font-bold mb-4 uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                                        Pending Action
                                    </h3>
                                    <div className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tighter">{stats.pending}</div>
                                    <p className="mt-4 text-xs font-medium text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-full">Require Review & Updates</p>
                                </div>
                            </div>

                            {/* Stat Card 3 (Full Width) */}
                            <div className="md:col-span-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-[2rem] p-6 sm:p-10 shadow-[0_10px_40px_rgb(99,102,241,0.3)] hover:shadow-[0_15px_50px_rgb(99,102,241,0.5)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden text-white group cursor-default">
                                <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900 opacity-20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="font-bold mb-3 uppercase tracking-widest text-xs text-indigo-100 opacity-90">
                                            Successfully Resolved
                                        </h3>
                                        <div className="flex items-baseline gap-4">
                                            <div className="text-5xl sm:text-7xl font-black tracking-tighter">{stats.resolved}</div>
                                            <div className="text-indigo-100 font-medium text-sm sm:text-lg">
                                                / {stats.total > 0 ? stats.total : 0} Total
                                            </div>
                                        </div>
                                        
                                        {stats.total > 0 && (
                                            <div className="w-full md:w-64 h-2.5 bg-black/20 rounded-full mt-6 overflow-hidden">
                                                <div 
                                                    className="h-full bg-white rounded-full transition-all duration-1500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                                    style={{ width: `${Math.round((stats.resolved / stats.total) * 100)}%`, transitionDelay: '500ms' }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white/20 p-5 sm:p-6 rounded-3xl backdrop-blur-md shadow-inner border border-white/30 transform group-hover:rotate-12 transition-transform duration-500 self-start md:self-auto">
                                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
