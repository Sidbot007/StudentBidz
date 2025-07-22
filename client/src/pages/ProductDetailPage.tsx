import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../lib/auth';
import { apiGet, apiPost, apiPatch } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { Product, Bid } from '../lib/types';
import { Clock, User as UserIcon, IndianRupee, ArrowLeft, Settings, RotateCcw, Ban, CheckCircle } from 'lucide-react';
import { queryClient } from '../lib/queryClient';
import { Client } from '@stomp/stompjs';

const bidSchema = z.object({
  amount: z.number().min(0.01, 'Bid amount must be greater than 0'),
});

const timeUpdateSchema = z.object({
  newEndTime: z.string().min(1, 'End time is required'),
  reason: z.string().min(1, 'Reason is required'),
});

const relistSchema = z.object({
  newEndTime: z.string().min(1, 'End time is required'),
});

type BidFormData = z.infer<typeof bidSchema>;
type TimeUpdateFormData = z.infer<typeof timeUpdateSchema>;
type RelistFormData = z.infer<typeof relistSchema>;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [showTimeUpdateForm, setShowTimeUpdateForm] = useState(false);
  const [showRelistForm, setShowRelistForm] = useState(false);
  const [timeUpdateNotification, setTimeUpdateNotification] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: () => apiGet(`/products/${id}`),
    enabled: !!id,
  });

  const { data: bids } = useQuery<Bid[]>({
    queryKey: ['/api/products', id, 'bids'],
    queryFn: () => apiGet(`/products/${id}/bids`),
    enabled: !!id,
  });

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const timeUpdateForm = useForm<TimeUpdateFormData>({
    resolver: zodResolver(timeUpdateSchema),
    defaultValues: {
      newEndTime: '',
      reason: '',
    },
  });

  const relistForm = useForm<RelistFormData>({
    resolver: zodResolver(relistSchema),
    defaultValues: {
      newEndTime: '',
    },
  });

  const bidMutation = useMutation({
    mutationFn: (data: BidFormData) => apiPost(`/products/${id}/bids`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', id, 'bids'] });
      form.reset();
      setBidError(null);
    },
    onError: (error: any) => {
      let message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message ||
        'An error occurred';
      console.log('Bid error message:', message); // Debug log
      setBidError(message);
    }
  });

  const timeUpdateMutation = useMutation({
    mutationFn: (data: TimeUpdateFormData) => apiPatch(`/products/${id}/update-time`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      setShowTimeUpdateForm(false);
      timeUpdateForm.reset();
    },
  });

  // Add declareWinner mutation
  const declareWinnerMutation = useMutation({
    mutationFn: (bidderId: number) =>
      apiPatch(`/products/${product?.id}/declare-winner/${bidderId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
    },
  });

  const relistMutation = useMutation({
    mutationFn: (data: RelistFormData) => apiPost(`/products/${id}/relist`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      setShowRelistForm(false);
      relistForm.reset();
    },
  });

  const restrictMutation = useMutation({
    mutationFn: (data: { userId: number; restrict: boolean }) =>
      data.restrict
        ? apiPatch(`/products/${id}/restrict-bidder/${data.userId}`)
        : apiPatch(`/products/${id}/unrestrict-bidder/${data.userId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      await queryClient.refetchQueries({ queryKey: ['/api/products', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', id, 'bids'] });
    },
  });

  // WebSocket setup for real-time time updates
  useEffect(() => {
    if (!id || !user) return;
    const token = localStorage.getItem('token');
    
    // Use environment variable for WebSocket URL, fallback to localhost
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    
    const client = new Client({
      brokerURL: `${wsBaseUrl}/ws?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/auction-time-update/${id}`, (msg: import('@stomp/stompjs').IMessage) => {
          const update = JSON.parse(msg.body);
          // Update the product data with new end time
          queryClient.setQueryData(['/api/products', id], (oldData: Product | undefined) => {
            if (oldData) {
              return { ...oldData, endTime: update.newEndTime };
            }
            return oldData;
          });
          // Show notification
          setTimeUpdateNotification(`Auction time updated by ${update.sellerUsername}: ${update.reason}`);
          setTimeout(() => setTimeUpdateNotification(''), 5000);
        });

        // Add subscription for winner declaration
        client.subscribe(`/topic/winner-declared/${id}`, (msg: import('@stomp/stompjs').IMessage) => {
          const winnerUsername = msg.body;
          queryClient.setQueryData(['/api/products', id], (oldData: Product | undefined) => {
            if (oldData) {
              return { ...oldData, status: 'SOLD', winnerUsername };
            }
            return oldData;
          });
        });
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); };
  }, [id, user]);

  // Update time remaining every second
  useEffect(() => {
    if (!product) return;
     product.biddingEndTime || product.endTime || '';
    const updateTimer = () => {
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [product]);

  const onTimeUpdateSubmit = (data: TimeUpdateFormData) => {
    timeUpdateMutation.mutate(data);
  };

  const onRelistSubmit = (data: RelistFormData) => {
    relistMutation.mutate(data);
  };

  // Helper to check if bidError is the frequency limit message
  bidError && bidError.includes('You can only bid once every 1 minute on this product');

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const endTime = product.biddingEndTime || product.endTime || '';
  const isActive = product.status === 'ACTIVE' && (endTime ? new Date() < new Date(endTime) : false);
  const isSold = product.status === 'SOLD';
  const isEnded = product.status === 'ENDED';
  const isOwner = user?.username === product.sellerUsername;
  const canBid = user && isActive && !isOwner;
  // Calculate minimum bid (current highest bid + 1)
  const minBid = (product?.currentBid ?? product?.startingPrice ?? 0) + 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Time Update Notification */}
        {timeUpdateNotification && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-800">{timeUpdateNotification}</span>
            </div>
          </div>
        )}

        <div className="mb-6">
          <Link href="/marketplace">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
            <img 
              src={`${apiBaseUrl}${product.imageUrl}`} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                <Badge 
                  variant={isSold ? "success" : isActive ? "default" : "secondary"}
                  className="flex items-center"
                >
                  {isSold && <CheckCircle className="h-4 w-4 mr-1" />}
                  {isEnded && <Clock className="h-4 w-4 mr-1" />}
                  {isSold ? 'Sold' : isActive ? 'Active' : 'Ended'}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>
              {isSold && product.winnerUsername && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="font-semibold text-green-800">
                    Winner: {product.winnerUsername}
                  </p>
                </div>
              )}
            </div>

            {/* Bidding Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 mr-2" />
                    Bidding Information
                  </div>
                  {user && product && user.username === product.sellerUsername && isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTimeUpdateForm(!showTimeUpdateForm)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Modify Time
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Show current bid and minimum bid */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Bid:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(product.currentBid ?? product.startingPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minimum Bid:</span>
                  <span className="text-sm">
                    {formatCurrency(minBid)}
                  </span>
                </div>

                {/* Bid Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => bidMutation.mutate(data))} className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bid Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min={minBid}
                              placeholder={minBid.toString()}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={!canBid || bidMutation.isPending}>
                      Place Bid
                    </Button>
                    {/* Show all bid errors below the button in red, styled like restricted message */}
                    {bidError && (
                      <div className="text-red-600 text-sm mt-2">
                        {bidError}
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Time Update Form for Seller */}
            {isOwner && isActive && showTimeUpdateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Modify Auction Time</CardTitle>
                  <CardDescription>
                    Extend or shorten the auction duration. Changes will be visible to all bidders in real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...timeUpdateForm}>
                    <form onSubmit={timeUpdateForm.handleSubmit(onTimeUpdateSubmit)} className="space-y-4">
                      <FormField
                        control={timeUpdateForm.control}
                        name="newEndTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New End Time</FormLabel>
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
                      <FormField
                        control={timeUpdateForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason for Change</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Extending due to high interest, Shortening due to urgent sale"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          disabled={timeUpdateMutation.isPending}
                        >
                          {timeUpdateMutation.isPending ? 'Updating...' : 'Update Time'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setShowTimeUpdateForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                  {timeUpdateMutation.error && (
                    <div className="mt-2 text-sm text-red-600">
                      {timeUpdateMutation.error.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Relist Form for Sold Items */}
            {isOwner && isSold && showRelistForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Relist Product</CardTitle>
                  <CardDescription>
                    Relist this sold product with a new auction. All previous bids will be cleared.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Your product will restart at the second-highest bid amount ({formatCurrency(product.secondHighestBid ?? product.startingPrice)}) instead of the original starting price of {formatCurrency(product.startingPrice)}.
                    </p>
                  </div>
                  <Form {...relistForm}>
                    <form onSubmit={relistForm.handleSubmit(onRelistSubmit)} className="space-y-4">
                      <FormField
                        control={relistForm.control}
                        name="newEndTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New End Time</FormLabel>
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
                          type="submit" 
                          disabled={relistMutation.isPending}
                        >
                          {relistMutation.isPending ? 'Relisting...' : 'Relist Product'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setShowRelistForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                  {relistMutation.error && (
                    <div className="mt-2 text-sm text-red-600">
                      {relistMutation.error.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Relist Button for Sold Items */}
            {isOwner && isSold && !showRelistForm && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Not satisfied with the winner? You can relist this product.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowRelistForm(!showRelistForm)}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Relist Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Bid History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {bids && bids.length > 0 ? (
              <div className="space-y-3">
                {bids
                  .slice()
                  .sort((a, b) => b.amount - a.amount) // Sort by amount in descending order
                  .slice(0, 10)
                  .map((bid, idx) => {
                    // Use latest product.restrictedBidders for each render
                    const isRestricted = bid.bidderId !== undefined && (product?.restrictedBidders ?? []).includes(bid.bidderId);
                    return (
                      <div key={bid.id ?? idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {user && bid.bidderId === user.id
                              ? 'You'
                              : user && product && user.username === product.sellerUsername
                                ? bid.bidderUsername
                                : 'Bidder'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(bid.amount)}
                          </span>
                          {/* Seller declare winner button */}
                          {user && product && user.username === product.sellerUsername && isActive && bid.bidderId && (
                            <Button
                              size="sm"
                              variant={product.winnerUsername === bid.bidderUsername ? 'secondary' : 'outline'}
                              style={product.winnerUsername === bid.bidderUsername ? { backgroundColor: '#555', color: '#fff' } : {}}
                              disabled={declareWinnerMutation.isPending || product.winnerUsername === bid.bidderUsername}
                              onClick={() => declareWinnerMutation.mutate(bid.bidderId!)}
                            >
                              {product.winnerUsername === bid.bidderUsername ? 'Winner' : 'Declare Winner'}
                            </Button>
                          )}
                          {user && product?.sellerUsername === user.username && (
                            <Button
                              className={isRestricted ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                              variant="ghost"
                              size="icon"
                              title={isRestricted ? 'Unrestrict this user' : 'Restrict this user from bidding'}
                              disabled={restrictMutation.isPending}
                              onClick={() => bid.bidderId !== undefined && restrictMutation.mutate({ userId: bid.bidderId, restrict: !isRestricted })}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No bids placed yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}