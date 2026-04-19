import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { chatComplete } from "@/lib/chat";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: 'สวัสดีครับ! ฉันคือ PUP AI ผู้ช่วยดูแลสุขภาพสัตว์เลี้ยงของคุณ บอกอาการหรือสอบถามได้เลยครับ',
  timestamp: new Date(),
};

const AIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useI18n();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setIsTyping(true);

    const content = await chatComplete(
      next.map(m => ({ role: m.role, content: m.content }))
    );

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
        <Card className="flex-1 flex flex-col shadow-luxury">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t('aichat.cardTitle')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('aichat.cardSubtitle')}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                  >
                    <Avatar className={message.role === 'assistant' ? 'bg-gradient-primary' : 'bg-gradient-secondary'}>
                      <AvatarFallback>
                        {message.role === 'assistant' ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-primary text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString('th-TH', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 animate-fade-in">
                    <Avatar className="bg-gradient-primary">
                      <AvatarFallback>
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background/50">
              <div className="flex gap-2">
                <Input
                  placeholder={t('aichat.inputPlaceholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12"
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity h-12 px-6"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('aichat.disclaimer')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">{t('aichat.suggestedTitle')}</p>
          <div className="flex flex-wrap gap-2">
            {[
              t('aichat.suggested1'),
              t('aichat.suggested2'),
              t('aichat.suggested3'),
              t('aichat.suggested4')
            ].map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                onClick={() => setInput(question)}
                className="hover:bg-primary/10 hover:text-primary hover:border-primary"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIChat;
