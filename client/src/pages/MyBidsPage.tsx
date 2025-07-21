import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiGet } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Product } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { Clock, IndianRupee, GanttChart } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import ChatIconButton from '../components/ui/ChatIconButton';
import { useState } from 'react';
import { X } from 'lucide-react';


export default function MyBidsPage() {
  const { user } = useAuth();
  const { data: bids, isLoading, error } = useQuery<Bid[]>({
    queryKey: ['/users/me/bids'],
    queryFn: () => apiGet('/users/me/bids'),
  });

  const deleteBidMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/bids/${id}`),
    onSuccess: () => {
      // Refetch bids after deletion
      window.location.reload();
    },
  });

  const [selectedType, setSelectedType] = useState<'ALL' | 'BOOKS' | 'ELECTRONICS' | 'CLOTHING' | 'STATIONARY' | 'ACCESSORIES' | 'OTHERS'>('ALL');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Error loading your bids.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bids</h1>
        {/* Category filter buttons */}
        <div className="flex space-x-4 mb-6">
          {['ALL', 'BOOKS', 'ELECTRONICS', 'CLOTHING', 'STATIONARY', 'ACCESSORIES', 'OTHERS'].map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-full font-semibold border ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300'} transition`}
              onClick={() => setSelectedType(type as any)}
            >
              {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {bids && bids.length === 0 ? (
          <div className="text-center py-12 text-gray-600">You have not placed any bids yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bids?.filter(bid => selectedType === 'ALL' || bid.product?.type === selectedType).map((bid) => (
              <Card key={bid.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden">
                    <img
                      src={`http://localhost:8080${bid.product?.imageUrl ?? ''}`}
                      alt={bid.product?.title ?? 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{bid.product?.title ?? 'Product'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    <span>Your Bid: {formatCurrency(bid.amount)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Status: </span>
                    <span className="ml-2 font-semibold">
                      {bid.product?.status === 'ACTIVE' && 'Active'}
                      {bid.product?.status === 'ENDED' && 'Ended'}
                      {bid.product?.status === 'SOLD' && 'Sold'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/product/${bid.product?.id}`} className="flex-1">
                      <Button className="w-full mt-2" disabled={bid.product?.status === 'SOLD'}>
                        {bid.product?.status === 'SOLD' ? 'Sold' : 'View Product'}
                      </Button>
                    </Link>
                    {user && bid.product?.winnerUsername === user.username && (
                      <ChatIconButton to={`/chat/${bid.product?.id}`} title="Chat" />
                    )}
                    <button
                      className="mt-2 ml-2 p-2 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
                      title="Delete Bid"
                      onClick={() => deleteBidMutation.mutate(bid.id)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 