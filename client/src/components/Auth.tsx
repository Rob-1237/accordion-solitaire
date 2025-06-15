import React, { useState } from 'react';
import { auth } from '../firebase'; // Import the auth instance
import {
  createUserWithEmailAndPassword, // For registration
  signInWithEmailAndPassword      // For login
} from 'firebase/auth';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(true); // New state to toggle between register/login

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      if (isRegistering) {
        // REGISTRATION LOGIC
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Registration successful! You can now log in.');
        console.log('User registered:', userCredential.user);
      } else {
        // LOGIN LOGIC
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setMessage('Login successful!');
        console.log('User logged in:', userCredential.user);
        // Important: We'll implement app-wide authentication state later,
        // so the form won't disappear yet, but the user is logged in internally.
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      // Handle Firebase specific errors for both register and login
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please try another or log in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. It must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-credential') { // Generic for wrong password/user not found
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-not-found') { // Login specific
        setError('No user found with this email.');
      } else if (err.code === 'auth/wrong-password') { // Login specific
        setError('Incorrect password.');
      } else {
        setError(`${isRegistering ? 'Registration' : 'Login'} failed: ${err.message}`);
      }
      console.error(`${isRegistering ? 'Registration' : 'Login'} error:`, err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </div>
        </form>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-center text-sm text-blue-500 hover:text-blue-800 w-full"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>

        {message && <p className="text-green-500 text-center mt-4">{message}</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Auth;