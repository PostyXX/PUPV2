export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-ai`;

export async function chatComplete(messages: ChatMessage[]): Promise<string> {
  const history = messages.slice(0, -1).filter(m => m.role !== 'system');
  const message = messages[messages.length - 1]?.content ?? '';

  try {
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply ?? 'ขออภัย ไม่สามารถตอบได้ในขณะนี้';
  } catch {
    return 'ขออภัย ไม่สามารถเชื่อมต่อได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
  }
}
