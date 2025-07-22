import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../lib/auth';
import { IndianRupee, Clock, X } from 'lucide-react';
import { apiPost } from '../lib/api';

const sellSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startingPrice: z.number().min(0.01, 'Starting price must be greater than 0'),
  biddingDuration: z.number().min(1, 'Duration must be at least 1 hour').max(168, 'Duration cannot exceed 1 week'),
  type: z.enum(['BOOKS', 'ELECTRONICS', 'CLOTHING', 'STATIONARY', 'ACCESSORIES', 'OTHERS']),
  image: z.any().refine((file) => file instanceof File, 'Image is required'),
});

type SellFormData = z.infer<typeof sellSchema>;

export default function SellPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      title: '',
      description: '',
      startingPrice: 0,
      biddingDuration: 24, // 24 hours default
      type: 'OTHERS',
      image: undefined,
    },
  });

  const sellMutation = useMutation({
    mutationFn: async (data: SellFormData) => {
      const endTime = new Date(Date.now() + data.biddingDuration * 60 * 60 * 1000);
      const formData = new FormData();
      formData.append('product', new Blob([JSON.stringify({
        title: data.title,
        description: data.description,
        startingPrice: data.startingPrice,
        endTime: endTime.toISOString(),
        type: data.type,
      })], { type: 'application/json' }));
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      // Use apiPost for consistency and correct base URL
      await apiPost('/products', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    },
    onSuccess: () => {
      setLocation('/marketplace');
    },
  });

  const onSubmit = (data: SellFormData) => {
    if (!selectedFile) {
      form.setError('image', { type: 'manual', message: 'Image is required' });
      return;
    }
    sellMutation.mutate(data);
  };

   (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                You need to be signed in to sell items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please sign in to start selling your items
                </p>
                <Button onClick={() => setLocation('/login')}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sell Your Item</h1>
          <p className="text-gray-600 mt-2">
            List your item for auction and let students bid on it
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Provide details about the item you want to sell
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., MacBook Pro 2020, Chemistry Textbook"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Describe the condition, usage, and any important details about your item"
                          rows={4}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <FormControl>
                        <select {...field} className="block w-full border rounded px-3 py-2">
                          <option value="BOOKS">Books</option>
                          <option value="ELECTRONICS">Electronics</option>
                          <option value="CLOTHING">Clothing</option>
                          <option value="STATIONARY">Stationary</option>
                          <option value="ACCESSORIES">Accessories</option>
                          <option value="OTHERS">Others</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              field.onChange(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            } else {
                              setSelectedFile(null);
                              field.onChange(undefined);
                              setImagePreview('');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {imagePreview && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Preview
                    </label>
                    <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="startingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="0.00"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biddingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bidding Duration (hours)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            min="1"
                            max="168"
                            placeholder="24"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Students can bid on your item during the auction period</li>
                    <li>• The highest bidder wins when the time expires</li>
                    <li>• You'll be able to chat with the winner to arrange pickup</li>
                    <li>• Make sure to use clear photos and accurate descriptions</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={sellMutation.isPending}
                >
                  {sellMutation.isPending ? 'Listing Item...' : 'List Item for Auction'}
                </Button>

                {sellMutation.error && (
                  <div className="text-red-600 text-sm text-center">
                    {sellMutation.error.message}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}