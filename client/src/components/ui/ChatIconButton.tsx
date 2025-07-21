import { Link } from 'wouter';
import { MessageSquare } from 'lucide-react';
import { Button } from './button';

export default function ChatIconButton({ to, title = 'Chat', disabled = false }: { to: string; title?: string; disabled?: boolean }) {
  return (
    <Link href={to}>
      <Button variant="outline" size="icon" title={title} disabled={disabled} className="ml-2">
        <MessageSquare className="h-5 w-5" />
      </Button>
    </Link>
  );
} 