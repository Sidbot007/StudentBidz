import { Link, useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { useAuth } from '../lib/auth';
import { Plus, LogOut, User, Info } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useState } from 'react';
import BiddingRulesModal from './BiddingRulesModal';

// Minimalist bag icon (same as landing page)
function BagIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 24 Q12 24 12 32 L12 52 Q12 60 20 60 L44 60 Q52 60 52 52 L52 32 Q52 24 48 24 Z" />
      <path d="M20 24 Q20 12 32 12 Q44 12 44 24" />
    </svg>
  );
}

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [showRules, setShowRules] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-blue-300 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <BagIcon className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">StudentBidz</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
              title="Bidding Rules"
              onClick={() => setShowRules(true)}
            >
              <Info className="h-6 w-6" />
            </button>
            {user ? (
              <>
                <Link href="/marketplace">
                  <Button variant={isActive('/marketplace') ? 'default' : 'ghost'} className="hidden sm:inline-flex">Browse Items</Button>
                </Link>
                <Link href="/my-items">
                  <Button variant={isActive('/my-items') ? 'default' : 'ghost'} className="hidden sm:inline-flex">My Items</Button>
                </Link>
                <Link href="/my-bids">
                  <Button variant={isActive('/my-bids') ? 'default' : 'ghost'} className="hidden sm:inline-flex">My Bids</Button>
                </Link>
                <Link href="/sell">
                  <Button variant={isActive('/sell') ? 'default' : 'ghost'} className="hidden sm:inline-flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Sell Item
                  </Button>
                </Link>
                <NotificationDropdown />
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    {user.name || user.username}
                  </div>
                  <Button variant="ghost" onClick={() => { logout(); setLocation('/'); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {showRules && (
        <BiddingRulesModal open={showRules} onClose={() => setShowRules(false)} />
      )}
    </nav>
  );
}