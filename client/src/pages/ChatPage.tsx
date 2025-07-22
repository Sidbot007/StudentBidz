import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { useAuth } from '../lib/auth';
import { apiGet} from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import type { Message } from '../lib/types';

export default function ChatPage() {
  const { id: productId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  // Fetch chat history
  useEffect(() => {
    if (!productId) return;
    apiGet<Message[]>(`/products/${productId}/messages`).then(setMessages);
  }, [productId]);

  // WebSocket setup
  useEffect(() => {
    if (!productId || !user) return;
    const token = localStorage.getItem('token');
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const client = new Client({
      brokerURL: `${wsBaseUrl}/ws?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat/${productId}`, (msg: import('@stomp/stompjs').IMessage) => {
          const message: Message = JSON.parse(msg.body);
          setMessages((prev) => [...prev, message]);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });
    client.activate();
    stompClientRef.current = client;
    return () => { setConnected(false); client.deactivate(); };
  }, [productId, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;
    stompClientRef.current?.publish({
      destination: `/app/chat/${productId}`,
      body: JSON.stringify({ senderUsername: user.username, content: input }),
    });
    setInput('');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Sign in to chat.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/product/${productId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Button>
          </Link>
        </div>
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderUsername === user.username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderUsername === user.username
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="border-t p-4 flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || !connected}>
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}