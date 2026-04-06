import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const LoginScreen = ({ role: initialRole }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState(initialRole || 'student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? `/api/auth/login` : `/api/auth/register`;
        const payload = { email, password, role };
        if (!isLogin) {
            payload.name = name;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Authentication successful:', data);
                // Save token to localStorage
                localStorage.setItem('userInfo', JSON.stringify(data));

                // Redirect based on role
                if (data.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/home');
                }
            } else {
                alert(`Authentication failed (${response.status}): ${data?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message || 'Please try again.'}`);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const response = await fetch(`/api/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credential: credentialResponse.credential,
                role
            }),
        });

        let data = null;

        try {
            data = await response.json();
        } catch (err) {
            console.error("Invalid JSON response");
        }

        if (response.ok) {
            console.log('Google Auth successful:', data);
            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } else {
            alert(`Google Auth failed (${response.status}): ${data?.message || 'Check database connection'}`);
        }

    } catch (error) {
        console.error('Google Auth Client Error:', error);
        alert(`Google Auth Error: ${error.message || 'Server error. Please try again.'}`);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-teal-200/40 rounded-full blur-3xl"></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative z-10">
                {!initialRole && (
                    <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                        <button
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${role === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${role === 'admin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setRole('admin')}
                        >
                            Admin
                        </button>
                    </div>
                )}

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {role === 'student' ? 'Student' : 'Admin'} {isLogin ? 'Login' : 'Sign Up'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to start suggesting.'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 placeholder-slate-400"
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 placeholder-slate-400"
                                id="email"
                                type="email"
                                placeholder="name@college.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 placeholder-slate-400"
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <button
                            className="w-full py-3.5 px-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200"
                            type="submit"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                        
                        <div className="text-center">
                            <button
                                type="button"
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                            alert('Google Login Failed');
                        }}
                        theme="outline"
                        shape="pill"
                        width="100%"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
