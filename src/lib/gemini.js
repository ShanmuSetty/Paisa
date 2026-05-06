const BASE = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGemini(systemContext, userMessage) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user',   content: userMessage },
      ],
      max_tokens: 1024,
    }),
  });

  if (res.status === 429) return "I'm getting too many requests right now. Try again in a moment!";

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'No response.';
}