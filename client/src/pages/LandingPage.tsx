import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Clock, MessageSquare, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Buy & Sell Student Items
            <span className="text-blue-600"> Through Bidding</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
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
              <Button variant="outline" size="lg" className="px-8 py-3">
                Browse Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose StudentBidz?
            </h3>
            <p className="text-lg text-gray-600">
              The perfect platform for students to buy and sell items with ease
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <BagIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Easy Bidding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Participate in exciting bidding wars to get the best deals on student items
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get instant notifications about bid updates and auction timers
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Direct Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with buyers and sellers through our built-in messaging system
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Student Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join a trusted community of students buying and selling items
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600">
              Simple steps to start buying and selling
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Register & Browse</h4>
              <p className="text-gray-600">
                Create your account and start browsing amazing student items for sale
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Bid & Win</h4>
              <p className="text-gray-600">
                Place competitive bids on items you want and win auctions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Connect & Trade</h4>
              <p className="text-gray-600">
                Chat with the seller and complete your transaction safely
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BagIcon className="h-8 w-8 text-blue-400 mr-2" />
              <h1 className="text-2xl font-bold">StudentBidz</h1>
            </div>
            <p className="text-gray-400 mb-4">
              The best place for students to buy and sell items through bidding
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-blue-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" className="text-white hover:text-blue-400">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}