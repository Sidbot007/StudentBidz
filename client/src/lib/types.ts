export interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  biddingEndTime?: string; // ISO date string, optional
  endTime?: string; // ISO date string, optional
  currentBid?: number; // optional
  secondHighestBid?: number; // optional
  sellerUsername: string;
  winnerUsername?: string;
  status: 'ACTIVE' | 'ENDED' | 'SOLD';
  restrictedBidders?: number[]; // user IDs restricted from bidding
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface Bid {
  id: number;
  amount: number;
  bidTime?: string;
  bidderUsername?: string;
  bidderId?: number;
  productId?: number;
  product?: Product;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'CHAT_MESSAGE' | 'DECLARED_WINNER' | 'OUTBID' | 'AUCTION_ENDING' | 'AUCTION_ENDED' | 'PRODUCT_RELISTED' | 'TIME_UPDATED';
  status: 'READ' | 'UNREAD';
  createdAt: string;
  relatedUrl?: string;
  productId?: number;
  productTitle?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
} 