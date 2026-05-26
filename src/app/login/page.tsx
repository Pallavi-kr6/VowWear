'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CornerDecoration from '@/components/CornerDecoration';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isLogin) {
        // Login request
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        // Better error handling
        if (!response.ok) {
          let message = 'Login failed';

          try {
            const errorData = await response.json();
            message = errorData.error || message;
          } catch {
            message = await response.text();
          }

          throw new Error(message);
        }

        // Success redirect
        router.push('/dashboard');
      } else {
        // Sign up request
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (!response.ok) {
          let message = 'Signup failed';

          try {
            const errorData = await response.json();
            message = errorData.error || message;
          } catch {
            message = await response.text();
          }

          throw new Error(message);
        }

        const data = await response.json();
        setSuccessMessage(data.message || 'Account created successfully!');
        setEmail('');
        setPassword('');
        
        // Auto-switch to login if email confirmation is off
        if (data.message.includes('sign in')) {
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMessage(null);
          }, 3000);
        }
      }
    } catch (err: unknown) {
      console.error('Auth Error:', err);

      if (err instanceof Error) {
        console.error('Stack:', err.stack);
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFDEE] px-4">
      <CornerDecoration position="top-left" />
      <CornerDecoration position="bottom-right" />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-[#1F3A4B]">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>

          <p className="text-gray-500 mt-2">
            {isLogin
              ? 'Enter your details to access your AI recommendations.'
              : 'Sign up to get personalized outfit suggestions.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#7ee16f] focus:outline-none focus:ring-2 focus:ring-[#7ee16f] sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#7ee16f] focus:outline-none focus:ring-2 focus:ring-[#7ee16f] sm:text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-500">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#7ee16f] px-4 py-2.5 text-sm font-medium text-[#0c0c0b] shadow-sm transition-all hover:bg-[#6ad15b] focus:outline-none focus:ring-2 focus:ring-[#7ee16f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : isLogin
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-[#1F3A4B]"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}