import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import { mockChatHistory, ChatMessage } from "@/data/mockData";
import { useI18n } from "@/lib/i18n";

const AI_API_ENABLED = import.meta.env.VITE_AI_API_ENABLED === 'true';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

function generateRuleBasedResponse(text: string): string {
  const t = text.toLowerCase();
  const adv = "หากอาการรุนแรงหรือไม่ดีขึ้นภายใน 24 ชม. ควรพาสัตว์เลี้ยงไปพบสัตวแพทย์ทันที นี่เป็นเพียงคำแนะนำเบื้องต้น ไม่ใช่การวินิจฉัยจากสัตวแพทย์";

  if (/อาเจียน|อ้วก|vomit/.test(t)) {
    return `จากอาการอาเจียน แนะนำให้:\n\n1) งดอาหาร 6-12 ชม. แต่ให้จิบน้ำบ่อยๆ\n2) สังเกตอาเจียนร่วมกับถ่ายเหลว/เลือดหรือไม่\n3) ถ้ามีอาการซึมหรือมีเลือด ควรพบสัตวแพทย์ทันที\n\n${adv}`;
  }
  if (/ถ่ายเหลว|ท้องเสีย|diarr/.test(t)) {
    return `อาการถ่ายเหลว แนะนำให้:\n\n1) ให้น้ำสะอาดและเกลือแร่สัตว์เลี้ยง\n2) งดอาหารมัน/นม\n3) หากถ่ายมีเลือดหรือมากกว่า 24 ชม. ให้พบสัตวแพทย์\n\n${adv}`;
  }
  if (/ไม่ยอมกิน|เบื่ออาหาร|ไม่กิน/.test(t)) {
    return `เบื่ออาหาร/ไม่กิน แนะนำให้:\n\n1) ลองเปลี่ยนเนื้อสัมผัสอาหาร อุ่นเล็กน้อย\n2) ตรวจดูช่องปาก/ฟัน/เหงือก\n3) ถ้ายังไม่กิน >24 ชม. หรือมีไข้ ควรพบสัตวแพทย์\n\n${adv}`;
  }
  if (/ไอ|จาม|มีน้ำมูก|cough|snee/.test(t)) {
    return `ไอ/จาม/น้ำมูก แนะนำให้:\n\n1) พักในที่อากาศถ่ายเท อุ่นพอเหมาะ\n2) เฝ้าระวังหายใจลำบาก/เขียวคล้ำ\n3) ถ้ามีไข้/ซึม/กินไม่ได้ ควรพบสัตวแพทย์\n\n${adv}`;
  }
  if (/ขนร่วง|ผิวหนัง|คัน|ผื่น/.test(t)) {
    return `ปัญหาผิวหนัง/ขนร่วง:\n\n1) หลีกเลี่ยงการเกา สวมปลอกคอกันเลียถ้าจำเป็น\n2) อาบน้ำด้วยแชมพูอ่อนโยนสำหรับสัตว์\n3) หากเป็นวงชัด/มีหนอง/มีกลิ่น ควรพบสัตวแพทย์\n\n${adv}`;
  }
  return `รับทราบค่ะ ขอบคุณสำหรับข้อมูล\n\nคุณสามารถตรวจสอบเบื้องต้นได้ดังนี้:\n1) ดูว่าสัตว์เลี้ยงยังกินน้ำและขยับตัวได้ตามปกติหรือไม่\n2) สังเกตอาการผิดปกติ เช่น ชัก หายใจลำบาก ซึมมาก มีเลือดออก\n3) หากอาการไม่ดีขึ้นหรือมีสัญญาณอันตราย ควรพาไปพบสัตวแพทย์ทันที\n\n${adv}`;
}

async function callGeminiFlash(userText: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return generateRuleBasedResponse(userText);
  }

  const systemPrompt =
    "คุณคือ \"PetCare AI\" ผู้ช่วยให้คำแนะนำเบื้องต้นเกี่ยวกับอาการป่วยของสัตว์เลี้ยงในบ้าน (เช่น สุนัข แมว) " +
    "ต้องปฏิบัติตามกฎต่อไปนี้อย่างเคร่งครัด:\n" +
    "- ห้ามวินิจฉัยโรคแทนสัตวแพทย์\n" +
    "- ห้ามบอกชื่อโรคแบบยืนยัน 100%\n" +
    "- ห้ามแนะนำยา ห้ามบอกชื่อยา ห้ามแนะนำให้ใช้ยาคนกับสัตว์\n" +
    "- ให้คำแนะนำในระดับเบื้องต้นเท่านั้น เน้นสิ่งที่เจ้าของทำได้อย่างปลอดภัย (safe-first)\n" +
    "- ถ้าอาการรุนแรง เช่น ชัก หายใจติดขัด ไม่กิน/ไม่ถ่าย มีเลือดออก ต้องแนะนำให้พบสัตวแพทย์ทันที\n" +
    "- ทุกคำตอบต้องเตือนเสมอว่า \"นี่ไม่ใช่การวินิจฉัยโรคจากสัตวแพทย์จริง\"\n\n" +
    "หลักการตอบ:\n" +
    "1) ฟังคำอธิบายอาการจากผู้ใช้\n" +
    "2) สรุประดับเบื้องต้นว่าอาจเกี่ยวข้องกับอะไร (แบบไม่ยืนยัน)\n" +
    "3) แนะนำสิ่งที่เจ้าของทำได้ทันทีที่ปลอดภัย\n" +
    "4) บอกสัญญาณอันตรายที่ควรพบสัตวแพทย์ทันที\n" +
    "5) ย้ำเสมอว่านี่ไม่ใช่การวินิจฉัยโรค";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { text: `คำถามเกี่ยวกับอาการสัตว์เลี้ยง: ${userText}` },
        ],
      },
    ],
  };

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        encodeURIComponent(GEMINI_API_KEY),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      throw new Error("Gemini API error: " + res.status);
    }

    const data: any = await res.json();
    const candidates = data.candidates || [];
    const first = candidates[0];
    const parts = first?.content?.parts || [];
    const text = parts
      .map((p: any) => (typeof p.text === "string" ? p.text : ""))
      .join("\n")
      .trim();

    if (!text) {
      return generateRuleBasedResponse(userText);
    }

    // ถ้าโมเดลพูดถึง "ยา" หรือการใช้ยา ให้ fallback เพื่อความปลอดภัย
    if (/ยา|ยาฆ่าเชื้อ|ยาปฏิชีวนะ|ยาแก้ปวด/i.test(text)) {
      return generateRuleBasedResponse(userText);
    }

    return text;
  } catch {
    return generateRuleBasedResponse(userText);
  }
}

const AIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useI18n();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    let content: string;
    if (AI_API_ENABLED && GEMINI_API_KEY) {
      content = await callGeminiFlash(userMessage.content);
    } else {
      content = generateRuleBasedResponse(userMessage.content);
    }

    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiResponse]);
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
