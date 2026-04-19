import { useEffect, useRef, useState } from 'react';
import { chatComplete, type ChatMessage } from '@/lib/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Loader2, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: t('chat.widget.initialGreeting'),
  } as ChatMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const content = input.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user', content } as ChatMessage];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await chatComplete(next);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: t('chat.widget.errorTemporary') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <Button
          className="rounded-full h-12 w-12 p-0 shadow-luxury bg-gradient-primary"
          onClick={() => setOpen(true)}
          aria-label={t('chat.widget.open')}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </Button>
      )}

      {open && (
        <Card className="w-[360px] h-[70vh] max-h-[520px] shadow-luxury animate-scale-in flex flex-col">
          <CardHeader className="p-4 border-b flex items-center justify-between shrink-0">
            <CardTitle className="text-base">{t('chat.widget.title')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 overflow-hidden min-h-0">
            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm ' +
                      (m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-background border rounded-bl-sm')
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t('chat.widget.loading')}
                </div>
              )}
            </div>
            <div className="p-3 border-t flex items-center gap-2">
              <Input
                placeholder={t('chat.widget.inputPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button onClick={send} disabled={loading || !input.trim()} className="bg-gradient-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
