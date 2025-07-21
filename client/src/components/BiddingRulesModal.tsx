import { Info } from 'lucide-react';

export default function BiddingRulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 text-gray-500"
          onClick={onClose}
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center"><Info className="h-6 w-6 mr-2" />Bidding Rules & Restrictions</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800 text-base">
          <li>You must be logged in to place a bid.</li>
          <li>You can only bid on active auctions.</li>
          <li>Your bid must be at least ₹1 higher than the current highest bid.</li>
          <li>You cannot bid more than 2x the current highest bid.</li>
          <li>You can only place one bid per product per minute.</li>
          <li>You cannot place more than 20 bids per product per day.</li>
          <li>You cannot place more than 50 bids in total per day.</li>
          <li>If you are restricted by the seller, you cannot bid on their product.</li>
          <li>If you win an auction and delete your bid, the seller will be notified and chat will be disabled.</li>
          <li>Only the seller can declare a winner before the auction ends.</li>
          <li>Image upload is mandatory when listing a product.</li>
          <li>Auctions can be listed for any duration (minimum 1 hour).</li>
          <li>Once an auction ends, you cannot place new bids.</li>
        </ul>
      </div>
    </div>
  );
} 