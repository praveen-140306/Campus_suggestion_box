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
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
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
                alert(data.message || 'Authentication failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const response = await fetch('https://campus-suggestion-box-final.vercel.app/api/auth/google', {
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
            alert(data?.message || 'Google Auth failed');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Server error. Please try again.');
    }
};

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-96">
                {!initialRole && (
                    <div className="flex mb-6 border-b">
                        <button
                            className={`w-1/2 py-2 text-center font-semibold ${role === 'student' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button
                            className={`w-1/2 py-2 text-center font-semibold ${role === 'admin' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                            onClick={() => setRole('admin')}
                        >
                            Admin
                        </button>
                    </div>
                )}

                <h2 className="mb-4 text-2xl font-bold text-center">
                    {role === 'student' ? 'Student' : 'Admin'} {isLogin ? 'Login' : 'Sign Up'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="name">
                                Name
                            </label>
                            <input
                                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                id="name"
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full px-3 py-2 mb-3 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-between gap-4 border-b pb-4 mb-4 border-gray-200">
                        <button
                            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                        <button
                            type="button"
                            className="text-sm text-blue-500 hover:text-blue-800"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                        </button>
                    </div>
                </form>
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 mb-4 block">Or continue with Google</span>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                            alert('Google Login Failed');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
