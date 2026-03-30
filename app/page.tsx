"use client";

import Image from "next/image";
import AuthControls from "./AuthControls";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { useToast } from "../lib/useToast";
import { useState } from "react";

export default function Home() {
  const { toasts, showToast, removeToast } = useToast();
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
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-between py-20 px-8">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-8 text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
            Elite Golf Club
          </h1>
          <p className="max-w-2xl text-xl text-zinc-300 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Experience the future of golf membership. Join our exclusive community and support charitable causes while enjoying premium golfing experiences.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
          <div className="card p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Premium Access</h3>
            <p className="text-zinc-400">Exclusive access to world-class golf courses and facilities</p>
          </div>

          <div className="card p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse-slow" style={{ animationDelay: "1s" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Charity Support</h3>
            <p className="text-zinc-400">Every membership contributes to meaningful charitable causes</p>
          </div>

          <div className="card p-8 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 animate-slide-in-left" style={{ animationDelay: "0.5s", animationDirection: "reverse" }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse-slow" style={{ animationDelay: "1.5s" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
            <p className="text-zinc-400">Join a network of passionate golf enthusiasts and professionals</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <button 
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="cta-button text-white text-lg font-semibold px-12 py-6 rounded-full text-xl flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubscribing ? (
              <>
                <LoadingSpinner size="sm" />
                Processing...
              </>
            ) : (
              "Subscribe & Support Charity"
            )}
          </button>
          <p className="text-zinc-500 text-sm animate-fade-in" style={{ animationDelay: "0.8s" }}>
            Join thousands of members making a difference through golf
          </p>
        </div>

        {/* Auth Controls */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: "1s" }}>
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
