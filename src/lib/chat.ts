export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

async function callOpenRouter(messages: ChatMessage[]) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `OpenRouter error: ${res.status}`);
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content || '';
  return content.trim();
}

// Simple local fallback for when no API key is available.
function localFallback(messages: ChatMessage[]) {
  const last = messages.filter(m => m.role === 'user').pop()?.content || '';
  const prefix = 'ผู้ช่วย PUP (โหมดออฟไลน์): ';
  if (!last) return prefix + 'สวัสดี! ฉันช่วยแนะนำโรงพยาบาลสัตว์ใกล้คุณได้ ลองบอกทำเลหรืออาการได้นะ';

  // Super-light rule-based hints
  if (/ฉุกเฉิน|emergency|เร่งด่วน/i.test(last)) {
    return prefix + 'กรุณาติดต่อโรงพยาบาลที่เปิด 24 ชม. ใกล้คุณทันที และเตรียมข้อมูลอาการ/ประวัติการแพ้ยา';
  }
  if (/วัคซีน|ฉีด/i.test(last)) {
    return prefix + 'โดยทั่วไป ควรนัดหมายฉีดวัคซีนตามรอบกับคลินิกใกล้บ้าน เพื่อลดความเครียดของสัตว์เลี้ยง';
  }
  if (/ใกล้/i.test(last)) {
    return prefix + 'คุณสามารถใช้หน้าโรงพยาบาลเพื่อดูระยะทางและกด “นำทาง” ได้เลย';
  }
  return prefix + 'ฉันรับทราบแล้ว ลองบอกอาการ ทำเล หรือคำถามเกี่ยวกับการดูแลสัตว์เลี้ยงเพิ่มเติมได้เลย';
}

export async function chatComplete(messages: ChatMessage[]) {
  if (!API_KEY) {
    return localFallback(messages);
  }
  try {
    return await callOpenRouter(messages);
  } catch (e) {
    return localFallback(messages);
  }
}
