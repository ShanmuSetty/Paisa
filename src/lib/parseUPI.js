export async function parseUPIScreenshot(base64Image, mimeType = 'image/jpeg') {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: `This is a UPI payment screenshot (PhonePe, GPay, Paytm, bank app, etc).
Extract the following and respond ONLY with a JSON object, nothing else:
{
  "amount": <number, just the rupee amount, no symbols>,
  "description": <string, merchant name or payment description, max 40 chars>,
  "date": <string, in YYYY-MM-DD format, or null if not visible>,
  "type": <"expense" if money was sent/paid, "income" if money was received>
}
If you cannot find a value, use null.`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    throw new Error('Could not parse AI response');
  }
}