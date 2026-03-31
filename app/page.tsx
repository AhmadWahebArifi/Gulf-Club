"use client";

import Image from "next/image";
import Link from "next/link";
import AuthControls from "./AuthControls";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";
import { useToast } from "../lib/useToast";
import { useAuth } from "../lib/AuthProvider";
import { useState } from "react";

export default function Home() {
  const { toasts, showToast, removeToast } = useToast();
  const { user, loading } = useAuth();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      showToast("Welcome to Elite Golf Club! Your subscription supports charity.", "success");
    }, 2000);
  };

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 sm:gap-8 text-center mb-12 sm:mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text leading-tight px-4">
            Elite Golf Club
          </h1>
          <p className="max-w-lg sm:max-w-2xl text-lg sm:text-xl text-zinc-300 leading-relaxed animate-fade-in px-4" style={{ animationDelay: "0.2s" }}>
            Experience the future of golf membership. Join our exclusive community and support charitable causes while enjoying premium golfing experiences.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full mb-12 sm:mb-16 px-4">
          <div className="card p-6 sm:p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Premium Access</h3>
            <p className="text-sm sm:text-base text-zinc-400">Exclusive access to world-class golf courses and facilities</p>
          </div>

          <div className="card p-6 sm:p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse-slow" style={{ animationDelay: "1s" }}>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Charity Support</h3>
            <p className="text-sm sm:text-base text-zinc-400">Every membership contributes to meaningful charitable causes</p>
          </div>

          <div className="card p-6 sm:p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-slide-in-left sm:col-span-2 lg:col-span-1" style={{ animationDelay: "0.5s", animationDirection: "reverse" }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse-slow" style={{ animationDelay: "1.5s" }}>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Community</h3>
            <p className="text-sm sm:text-base text-zinc-400">Join a network of passionate golf enthusiasts and professionals</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fade-in-up px-4" style={{ animationDelay: "0.6s" }}>
          {loading ? (
            <div className="w-48 sm:w-64 h-12 sm:h-16 bg-white/10 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white/30 rounded-full animate-pulse"></div>
            </div>
          ) : user ? (
            <Link 
              href="/dashboard"
              className="cta-button text-white text-base sm:text-lg font-semibold px-8 sm:px-12 py-4 sm:py-6 rounded-full text-lg sm:text-xl flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-200 text-center"
            >
              Go to Dashboard
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : (
            <Link 
              href="/login"
              className="cta-button text-white text-base sm:text-lg font-semibold px-8 sm:px-12 py-4 sm:py-6 rounded-full text-lg sm:text-xl flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-200 text-center"
            >
              Get Started
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
          <p className="text-zinc-500 text-xs sm:text-sm animate-fade-in px-4 text-center" style={{ animationDelay: "0.8s" }}>
            {user 
              ? "Track your scores, support charity, and win prizes" 
              : "Join thousands of members making a difference through golf"
            }
          </p>
        </div>

        {/* Demo Credentials */}
        {!user && (
          <div className="animate-fade-in-up w-full max-w-sm px-4" style={{ animationDelay: "1s" }}>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Demo Account</h3>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Email:</span>
                  <code className="bg-black/30 px-2 py-1 rounded text-white font-mono text-xs">demo2@test.com</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Password:</span>
                  <code className="bg-black/30 px-2 py-1 rounded text-white font-mono text-xs">demo123</code>
                </div>
              </div>
              <Link
                href="/login"
                className="mt-3 sm:mt-4 w-full inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Quick Login with Demo
              </Link>
            </div>
          </div>
        )}

        {/* Auth Controls */}
        <div className="mt-8 sm:mt-12 animate-fade-in px-4" style={{ animationDelay: "1s" }}>
          <AuthControls />
        </div>

      </main>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
