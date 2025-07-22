import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/auth";
import { queryClient } from "./lib/queryClient";
import  Navigation from './components/Navigation';
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MarketplacePage from "./pages/MarketplacePage";
import SellPage from "./pages/SellPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SoldItemsPage from "./pages/SoldItemsPage";
import MyBidsPage from "./pages/MyBidsPage";
import ChatPage from "./pages/ChatPage";

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      <Switch>
        <Route path="/" component={user ? MarketplacePage : LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/marketplace" component={MarketplacePage} />
        <Route path="/sell" component={SellPage} />
        <Route path="/product/:id" component={ProductDetailPage} />
        <Route path="/my-items" component={SoldItemsPage} />
        <Route path="/my-bids" component={MyBidsPage} />
        <Route path="/chat/:id" component={ChatPage} />
        <Route>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-blue-600 hover:underline">
                  Go back to home
        </a>
      </div>
            </div>
          </div>
        </Route>
      </Switch>
      </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRouter />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}