import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiGet } from '../lib/api';
import type { Product } from '../lib/types';
import { Client, IMessage } from '@stomp/stompjs';
import { formatCurrency } from '../lib/utils';
import { Clock } from 'lucide-react';
import { queryClient } from '../lib/queryClient';
import { useAuth } from '../lib/auth';

function ProductCard({ product }: { product: Product }) {
  const {} = useAuth();
  // Use endTime if biddingEndTime is missing
  const endTime = product.biddingEndTime || product.endTime || '';
  const timeRemaining = formatTimeRemaining(new Date(endTime));
  const isActive = endTime ? new Date() < new Date(endTime) : false;

  // Calculate if ending soon (less than 1 hour left)
  let isEndingSoon = false;
  if (isActive && endTime) {
    const msLeft = new Date(endTime).getTime() - Date.now();
    isEndingSoon = msLeft > 0 && msLeft <= 60 * 60 * 1000;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow border border-gray-200 rounded-xl p-0 overflow-hidden bg-white">
      <div className="flex flex-col h-full">
        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          <img 
            src={`http://localhost:8080${product.imageUrl}`} 
            alt={product.title}
            className="w-full h-full object-contain rounded-t-xl"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between p-4">
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{product.title}</h2>
              <Badge variant={isActive ? "default" : "secondary"} className="ml-2">
                {isActive ? "Active" : "Ended"}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm line-clamp-2 mb-2">{product.description}</p>
            {isEndingSoon && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold animate-pulse mb-2">Ending Soon</span>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Starting</span>
              <span className="text-sm font-medium text-gray-700 flex items-center"><IndianRupee className="h-4 w-4 mr-1" />{formatCurrency(product.startingPrice)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">Current Bid</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(product.currentBid ?? product.startingPrice)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeRemaining}</span>
            </div>
          </div>
          <Link href={`/product/${product.id}`}>
            <Button className="w-full" disabled={!isActive}>
              {isActive ? "View & Bid" : "View Results"}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'ALL' | 'BOOKS' | 'ELECTRONICS' | 'CLOTHING' | 'STATIONARY' | 'ACCESSORIES' | 'OTHERS'>('ALL');
  const stompClientRef = useRef<Client | null>(null);

  const { data: products, isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ['/products/type', selectedType],
    queryFn: () => apiGet<Product[]>(`/products/type/${selectedType}`),
  });

  // WebSocket setup for real-time time updates
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const client = new Client({
      brokerURL: `ws://localhost:8080/ws?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to time updates for all products
        products?.forEach(product => {
          client.subscribe(`/topic/auction-time-update/${product.id}`, (msg) => {
            const update = JSON.parse(msg.body);
            // Update the product in the list
            queryClient.setQueryData(['/api/products'], (oldData: Product[] | undefined) => {
              if (oldData) {
                return oldData.map(p => 
                  p.id === update.productId 
                    ? { ...p, endTime: update.newEndTime }
                    : p
                );
              }
              return oldData;
            });
          });
        });
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [user, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="aspect-square rounded-lg bg-gray-200 mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h2>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-2">
              Discover amazing deals on student items through bidding
            </p>
          </div>
          <Link href="/sell">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sell Item
            </Button>
          </Link>
        </div>
        {/* Always show filter buttons */}
        <div className="flex space-x-4 mb-6">
          {['ALL', 'BOOKS', 'ELECTRONICS', 'CLOTHING', 'STATIONARY', 'ACCESSORIES', 'OTHERS'].map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-full font-semibold border ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300'} transition`}
              onClick={() => { setSelectedType(type as any); refetch(); }}
            >
              {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {products && products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Items Available</h2>
            <p className="text-gray-600 mb-6">Be the first to list an item for sale!</p>
            <div className="flex justify-center gap-4">
              <Link href="/sell">
                <Button>List Your First Item</Button>
              </Link>
              {selectedType !== 'ALL' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedType('ALL');
                    refetch();
                  }}
                >
                  Back to Marketplace
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}