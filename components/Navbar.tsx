"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthProvider";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAdmin = () => {
    const configured = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
    const emails = (configured ? configured.split(",") : ["admin@golfclub.com"])
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const current = user?.email?.toLowerCase() ?? "";
    return Boolean(current && emails.includes(current));
  };

  return (
    <nav className="w-full bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-bold text-xl">Elite Golf Club</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            
            <Link 
              href="/dashboard" 
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>

            {isAdmin() && (
              <Link 
                href="/admin" 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side - Auth */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/60 text-sm hidden sm:block">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-white/80 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/10 py-4">
          <div className="flex flex-col space-y-3">
            <Link 
              href="/" 
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            
            <Link 
              href="/dashboard" 
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>

            {isAdmin() && (
              <Link 
                href="/admin" 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                Admin
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium text-left"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
