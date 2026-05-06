// api/whatsapp.js
// Vercel serverless function — receives WhatsApp messages via Twilio webhook

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CATEGORIES = [
  'food', 'transport', 'apparel', 'skincare',
  'bills', 'entertainment', 'misc',
  'salary', 'allowance', 'returns'
];

const HELP = `paisa bot commands:

*spent 250 on food* — log expense
*got 50000 salary* — log income  
*spent 100 cash on transport* — with payment method
*balance* — see this month summary
*help* — show this message

Categories: food, transport, apparel, skincare, bills, entertainment, misc
Income: salary, allowance, returns`;

async function parseMessage(text) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `You parse natural language expense/income messages into JSON.
Available expense categories: food, transport, apparel, skincare, bills, entertainment, misc
Available income categories: salary, allowance, returns
Payment methods: bank (default), cash

Respond ONLY with JSON, nothing else:
{
  "type": "expense" or "income",
  "amount": number,
  "category": one of the categories above,
  "description": short description string,
  "payment_method": "bank" or "cash"
}

Examples:
"spent 250 on food" → {"type":"expense","amount":250,"category":"food","description":"Food","payment_method":"bank"}
"bought shirt for 800" → {"type":"expense","amount":800,"category":"apparel","description":"Shirt","payment_method":"bank"}
"got salary 45000" → {"type":"income","amount":45000,"category":"salary","description":"Salary","payment_method":"bank"}
"paid 50 cash auto" → {"type":"expense","amount":50,"category":"transport","description":"Auto","payment_method":"cash"}`,
        },
        { role: 'user', content: text },
      ],
    }),
  });

  const data = await res.json();
  const raw  = data.choices?.[0]?.message?.content ?? '';
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function getMonthSummary() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const next  = String(now.getMonth() + 2).padStart(2, '0');

  const { data } = await supabase
    .from('transactions')
    .select('type, amount, category')
    .eq('user_id', process.env.PAISA_USER_ID)
    .gte('txn_date', `${year}-${month}-01`)
    .lt('txn_date',  `${year}-${next}-01`);

  const txns = data ?? [];
  const income  = txns.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);

  const cats = {};
  for (const t of txns.filter(t => t.type === 'expense')) {
    cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount);
  }
  const topCats = Object.entries(cats)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 3)
    .map(([k,v]) => `  ${k}: ₹${Math.round(v)}`)
    .join('\n');

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `*${months[now.getMonth()]} summary*\n\nIncome: ₹${Math.round(income)}\nSpent: ₹${Math.round(expense)}\nSaved: ₹${Math.round(income - expense)}\n\nTop spending:\n${topCats || '  (none yet)'}`;
}

function twiml(message) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // parse Twilio form body
  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
  });
  const params = new URLSearchParams(body);
  const text = (params.get('Body') ?? '').trim().toLowerCase();

  res.setHeader('Content-Type', 'text/xml');

  if (!text) {
    return res.send(twiml(HELP));
  }

  // balance / summary command
  if (text === 'balance' || text === 'summary') {
    try {
      const summary = await getMonthSummary();
      return res.send(twiml(summary));
    } catch {
      return res.send(twiml('Could not fetch balance. Try again.'));
    }
  }

  // help command
  if (text === 'help' || text === 'hi' || text === 'hello') {
    return res.send(twiml(HELP));
  }

  // parse as transaction
  try {
    const parsed = await parseMessage(text);

    if (!parsed.amount || parsed.amount <= 0) {
      return res.send(twiml("I couldn't understand that. Try: *spent 200 on food* or *got 5000 salary*"));
    }

    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('transactions').insert({
      user_id: process.env.PAISA_USER_ID,
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      txn_date: today,
      payment_method: parsed.payment_method ?? 'bank',
      note: `via WhatsApp: "${text}"`,
    });

    if (error) throw error;

    const emoji = parsed.type === 'income' ? '✅' : '💸';
    const verb  = parsed.type === 'income' ? 'Logged income' : 'Logged expense';
    return res.send(twiml(
      `${emoji} ${verb}\n\n*${parsed.description}*\n₹${parsed.amount} · ${parsed.category} · ${parsed.payment_method}\n\nLogged to paisa!`
    ));
  } catch {
    return res.send(twiml("I couldn't understand that. Try: *spent 200 on food*\n\nSend *help* for all commands."));
  }
}