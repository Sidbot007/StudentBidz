import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Users, Clock, MessageSquare, Info, Search, Gavel, Trophy } from 'lucide-react';
import { useState } from 'react';
import BiddingRulesModal from '../components/BiddingRulesModal';

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
      {/* Bag outline */}
      <path d="M16 24 Q12 24 12 32 L12 52 Q12 60 20 60 L44 60 Q52 60 52 52 L52 32 Q52 24 48 24 Z" />
      {/* Bag handle */}
      <path d="M20 24 Q20 12 32 12 Q44 12 44 24" />
    </svg>
  );
}

export default function LandingPage() {
  const [showRules, setShowRules] = useState(false);
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BagIcon className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">StudentBidz</h1>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                title="Bidding Rules"
                onClick={() => setShowRules(true)}
              >
                <Info className="h-6 w-6" />
              </button>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {showRules && (
        <BiddingRulesModal open={showRules} onClose={() => setShowRules(false)} />
      )}

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-50 mb-6">
            Buy & Sell Student Items
            <span className="text-blue-500"> Through Bidding</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the ultimate student marketplace where you can find amazing deals on used items 
            and sell your own products through an exciting bidding system.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="px-8 py-3">
                Browse Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-blue-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Choose StudentBidz?</h2>
            <p className="mt-4 text-lg text-blue-100">
              The perfect platform for students to buy and sell items with ease.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center text-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-blue-600 mb-4 mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">For Students, By Students</h3>
              <p className="mt-2 text-base text-blue-200">
                A marketplace exclusively for the student community.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="text-center text-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-blue-600 mb-4 mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">Real-Time Bidding</h3>
              <p className="mt-2 text-base text-blue-200">
                Experience the thrill of live auctions and snag the best deals.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="text-center text-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-blue-600 mb-4 mx-auto">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">Secure Chat</h3>
              <p className="mt-2 text-base text-blue-200">
                Connect with sellers and winners safely after an auction ends.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="text-center text-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-blue-600 mb-4 mx-auto">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">Fair Bidding Rules</h3>
              <p className="mt-2 text-base text-blue-200">
                Our rules ensure a fair and transparent bidding process for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-50">How It Works</h2>
            <p className="mt-4 text-lg text-gray-300">
              A simple, secure, and fun way to trade within the student community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900 p-8 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-50">Find an Item</h3>
              <p className="mt-2 text-base text-gray-400">
                Browse our marketplace for items listed by fellow students.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-slate-900 p-8 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <Gavel className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-50">Place a Bid</h3>
              <p className="mt-2 text-base text-gray-400">
                Enter your bid and stay updated in real-time. Outbid others to win.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-slate-900 p-8 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-50">Win & Collect</h3>
              <p className="mt-2 text-base text-gray-400">
                If your bid is the highest when the auction ends, the item is yours!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-50">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Create an account today and start bidding, or list your own items for sale.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            &copy; 2025 StudentBidz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}