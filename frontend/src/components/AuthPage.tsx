import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, UserRound, CalendarDays } from 'lucide-react';
import { apiService } from '../services/apiService';
import { AuthUser } from '../types/api';

interface AuthPageProps {
  onAuthenticated: (token: string, user: AuthUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = isSignup
        ? await apiService.signup(email, password, displayName, Number(age))
        : await apiService.login(email, password);
      onAuthenticated(response.token, response.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="mb-8">
          <p className="text-sm font-bold text-[#db4444]">Amazon 2023 catalogue</p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-950">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isSignup
              ? 'Create an account to explore recommendations.'
              : 'Sign in to browse the catalogue and recommendations.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Display name</span>
              <span className="relative block">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
                />
              </span>
            </label>
          )}
          {isSignup && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Age</span>
              <span className="relative block">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  min={1}
                  max={120}
                  type="number"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
                />
              </span>
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Password</span>
            <span className="relative block">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
              />
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={isSubmitting}
            className="w-full rounded-md bg-black py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
            {!isSubmitting && <ArrowRight className="ml-2 inline-block h-4 w-4" />}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignup((current) => !current);
            setError('');
          }}
          className="mt-6 w-full text-center text-sm text-gray-600 hover:text-black"
        >
          {isSignup ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </main>
  );
};
