import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { saveUserProfile } from '../services/firebaseService';

const Auth: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(true);

    const navigate = useNavigate();

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName });
                await saveUserProfile(userCredential.user.uid, { displayName, email });
                setMessage('Registration successful! You can now log in.');
                console.log('User registered:', userCredential.user);
                setIsRegistering(false); // Optionally switch to login form after registration
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                setMessage('Login successful!');
                console.log('User logged in:', userCredential.user);
                navigate('/'); // Navigate to game page after successful login
            }
            setEmail('');
            setPassword('');
            setDisplayName('');
        } catch (err: any) {
            // Firebase Auth error codes: https://firebase.google.com/docs/reference/js/auth.md#autherrorcodes
            let errorMsg = 'An error occurred. Please try again.';
            if (err && err.code) {
                if (err.code === 'auth/user-not-found') {
                    errorMsg = 'No account found with this email.';
                } else if (err.code === 'auth/wrong-password') {
                    errorMsg = 'Incorrect password. Please try again.';
                } else if (err.code === 'auth/invalid-email') {
                    errorMsg = 'Invalid email address.';
                } else if (err.code === 'auth/too-many-requests') {
                    errorMsg = 'Too many failed attempts. Please try again later.';
                } else if (err.message) {
                    errorMsg = err.message;
                }
            }
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handlePlayAnonymously = () => {
        navigate('/');
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'rgb(0, 0, 0, .65)' }} className="fixed inset-0 flex items-center justify-center z-10">
            <div className="shadow-2xl rounded-2xl p-8 backdrop-blur-lg" style={{ width: '400px', minHeight: '500px' }}>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {isRegistering ? 'Register' : 'Login'}
                </h2>
                <form onSubmit={handleAuthAction}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {isRegistering && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
                                Display Name:
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="glass-shimmer relative bg-white/20 border border-white/30 text-white font-bold rounded-lg px-4 py-2 backdrop-blur-md shadow-lg transition-all duration-200 w-full"
                        >
                            {isRegistering ? 'Register' : 'Login'}
                        </button>
                    </div>
                </form>

                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="glass-shimmer mt-4 text-center text-sm text-blue-200 hover:text-blue-100 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 backdrop-blur-md transition-all duration-200"
                >
                    {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>

                {/* Play Anonymously */}
                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={handlePlayAnonymously}
                        className="glass-shimmer bg-white/20 border border-white/30 text-white font-bold rounded-lg px-4 py-2 backdrop-blur-md shadow-lg transition-all duration-200 w-full"
                    >
                        Play Anonymously
                    </button>
                </div>

                {message && <p className="text-green-500 text-center mt-4">{message}</p>}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default Auth;