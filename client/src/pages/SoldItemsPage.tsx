import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import type { Product } from '../lib/types';
import { Link } from 'wouter';
import { Clock, IndianRupee, Trash2, RotateCcw } from 'lucide-react';
import { formatCurrency, formatTimeRemaining } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { queryClient } from '../lib/queryClient';
import ChatIconButton from '../components/ui/ChatIconButton';

const relistSchema = z.object({
  newEndTime: z.string().min(1, 'End time is required'),
});

type RelistFormData = z.infer<typeof relistSchema>;

export default function SoldItemsPage() {
  useAuth();
  const [relistingProductId, setRelistingProductId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'ALL' | 'BOOKS' | 'ELECTRONICS' | 'CLOTHING' | 'STATIONARY' | 'ACCESSORIES' | 'OTHERS'>('ALL');
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/products/seller'],
    queryFn: () => apiGet('/products/seller'),
  });

  const relistForm = useForm<RelistFormData>({
    resolver: zodResolver(relistSchema),
    defaultValues: {
      newEndTime: '',
    },
  });

  const relistMutation = useMutation({
    mutationFn: (data: { productId: number; formData: RelistFormData }) =>
      apiPost(`/products/${data.productId}/relist`, data.formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/products/seller'] });
      setRelistingProductId(null);
      relistForm.reset();
    },
  });

  const handleRelist = (productId: number) => {
    const formData = relistForm.getValues();
    relistMutation.mutate({ productId, formData });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Error loading your items.</div>;
  }

  const isActive = (product: Product) => {
    const endTime = product.biddingEndTime || product.endTime || '';
    return endTime ? new Date() < new Date(endTime) : false;
  };

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Items</h1>
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
        {products && products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="mb-4">You haven't listed any items yet.</p>
            <Link href="/sell">
              <Button>List Your First Item</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.filter(product => selectedType === 'ALL' || product.type === selectedType).map((product) => {
              const active = isActive(product);
              const isSold = product.status === 'SOLD';
              const isSelling = product.status === 'ACTIVE' && active;
              const isEnded = product.status === 'ACTIVE' && !active;
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 flex flex-row justify-between items-start">
                    <div className="flex-1">
                      <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden">
                        <img
                          src={`${apiBaseUrl}${product.imageUrl}`}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    </div>
                    {/* Delete button for selling (active) and unsold (ended) products */}
                    {(isSelling || product.status === 'ENDED') && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this item from the marketplace?')) {
                            await apiDelete(`/products/${product.id}`);
                            queryClient.invalidateQueries({ queryKey: ['/products/seller'] });
                          }
                        }}
                        title="Delete Product"
                        className="ml-2 p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        <span>
                          {isSold 
                            ? `Sold for: ${formatCurrency(product.currentBid ?? product.startingPrice)}`
                            : `Current: ${formatCurrency(product.currentBid ?? product.startingPrice)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isSold ? "secondary" : isSelling ? "default" : "outline"}
                          className={isEnded ? "bg-yellow-100 text-yellow-800" : ""}
                        >
                          {isSold ? "Sold" : isSelling ? "Selling" : (product.status === 'ENDED' ? 'Unsold' : 'Ended')}
                        </Badge>
                        {/* Relist button beside Unsold badge for ENDED products */}
                        {product.status === 'ENDED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRelistingProductId(product.id)}
                            disabled={relistingProductId === product.id}
                            className="ml-1"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isSelling && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTimeRemaining(new Date(product.endTime || product.biddingEndTime || ''))}</span>
                      </div>
                    )}

                    {/* Relist Form for Sold and Unsold (ENDED) Items */}
                    {(isSold || product.status === 'ENDED') && relistingProductId === product.id && (
                      <div className="border-t pt-3">
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your product will restart at the second-highest bid amount ({formatCurrency(product.secondHighestBid ?? product.startingPrice)}) instead of the original starting price. If unsold, it will restart at the original starting price.
                          </p>
                        </div>
                        <Form {...relistForm}>
                          <form className="space-y-3">
                            <FormField
                              control={relistForm.control}
                              name="newEndTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">New End Time</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      min={new Date().toISOString().slice(0, 16)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex space-x-2">
                              <Button 
                                type="button"
                                size="sm"
                                onClick={() => handleRelist(product.id)}
                                disabled={relistMutation.isPending}
                              >
                                {relistMutation.isPending ? 'Relisting...' : 'Relist'}
                              </Button>
                              <Button 
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setRelistingProductId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Link href={`/product/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          {isSelling ? "View & Manage" : "View Details"}
                        </Button>
                      </Link>
                      {/* Show chat icon only if there is a winner */}
                      {product.winnerUsername && (
                        <ChatIconButton to={`/chat/${product.id}`} title="Chat with Winner" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 