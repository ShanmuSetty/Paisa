import { createClient } from '@supabase/supabase-js';

const HELP = `paisa bot 💰

*spent 250 on food* — log expense
*got 45000 salary* — log income
*spent 100 cash on transport* — cash payment
*balance* — this month summary
*ask anything* — chat with AI about your finances
*help* — show this message

Categories: food, transport, apparel, skincare, bills, entertainment, misc
Income: salary, allowance, returns`;

async function parseMessage(text) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `You parse natural language expense/income messages into JSON.
Expense categories: food, transport, apparel, skincare, bills, entertainment, misc
Income categories: salary, allowance, returns
Payment methods: bank (default), cash
Respond ONLY with valid JSON, nothing else:
{"type":"expense|income","amount":number,"category":"string","description":"string","payment_method":"bank|cash"}`,
        },
        { role: 'user', content: text },
      ],
    }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

async function getMonthSummary(supabase) {
  const now       = new Date();
  const year      = now.getFullYear();
  const month     = String(now.getMonth() + 1).padStart(2, '0');
  const nextDate  = new Date(year, now.getMonth() + 1, 1);
  const nextYear  = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');

  const { data } = await supabase
    .from('transactions')
    .select('type, amount, category')
    .eq('user_id', process.env.VITE_USER_ID)
    .gte('txn_date', `${year}-${month}-01`)
    .lt('txn_date',  `${nextYear}-${nextMonth}-01`);

  const txns    = data ?? [];
  const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const cats = {};
  for (const t of txns.filter(t => t.type === 'expense'))
    cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount);
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([k, v]) => `  ${k}: ₹${Math.round(v)}`).join('\n');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `*${months[now.getMonth()]} summary*\n\nIncome: ₹${Math.round(income)}\nSpent:  ₹${Math.round(expense)}\nSaved:  ₹${Math.round(income - expense)}\n\nTop spending:\n${topCats || '  (none yet)'}`;
}

async function buildFinanceContext(supabase) {
  const now       = new Date();
  const year      = now.getFullYear();
  const month     = String(now.getMonth() + 1).padStart(2, '0');
  const nextDate  = new Date(year, now.getMonth() + 1, 1);
  const nextYear  = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
  const monthName = now.toLocaleString('en-IN', { month: 'long' });
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
  const daysPassed  = now.getDate();

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', process.env.VITE_USER_ID)
    .gte('txn_date', `${year}-${month}-01`)
    .lt('txn_date',  `${nextYear}-${nextMonth}-01`)
    .order('txn_date', { ascending: false });

  const txns    = data ?? [];
  const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const cats = {};
  for (const t of txns.filter(t => t.type === 'expense'))
    cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount);

  const catLines = Object.entries(cats)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  - ${k}: ₹${Math.round(v)}`)
    .join('\n');

  const recentLines = txns.slice(0, 10)
    .map(t => `  - ${t.txn_date} | ${t.type === 'income' ? '+' : '-'}₹${t.amount} | ${t.category} | ${t.description}`)
    .join('\n');

  return `You are a friendly personal finance assistant for "paisa", a budget tracking app.
The user's currency is Indian Rupees (₹). Be concise and practical. Max 3-4 sentences per reply.
Never make up data — only use what's provided below.
The user is messaging you via WhatsApp so keep responses short and clear, no markdown except *bold*.

=== ${monthName} ${year} (day ${daysPassed} of ${daysInMonth}) ===
Total income:  ₹${Math.round(income)}
Total spent:   ₹${Math.round(expense)}
Saved so far:  ₹${Math.round(income - expense)}

=== Spending by category ===
${catLines || '  (no expenses yet)'}

=== Recent transactions ===
${recentLines || '  (none yet)'}`;
}

async function askAi(supabase, userMessage) {
  const context = await buildFinanceContext(supabase);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: context },
        { role: 'user',   content: userMessage },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'Sorry, I could not get a response. Try again.';
}

function isAiQuestion(text) {
  const triggers = [
    'ask', 'why', 'how', 'what', 'where', 'when', 'should', 'can i',
    'am i', 'is my', 'analyse', 'analyze', 'suggest', 'advice', 'tip',
    'overspend', 'saving', 'budget', 'cut', 'reduce', 'compare', '?',
  ];
  return triggers.some(t => text.includes(t));
}

function twiml(msg) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`;
}

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_KEY
  );

  res.setHeader('Content-Type', 'text/xml');

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/plain');
    return res.send('paisa whatsapp bot is live ✓');
  }

  if (req.method !== 'POST') return res.status(405).end();

  const text = ((req.body && req.body.Body) ? req.body.Body : '').trim().toLowerCase();

  if (!text || text === 'help' || text === 'hi' || text === 'hello')
    return res.send(twiml(HELP));

  if (text === 'balance' || text === 'summary') {
    try { return res.send(twiml(await getMonthSummary(supabase))); }
    catch { return res.send(twiml('Could not fetch balance. Try again.')); }
  }

  // AI chat mode — questions and analysis
  if (isAiQuestion(text)) {
    try {
      const reply = await askAi(supabase, text);
      return res.send(twiml(reply));
    } catch {
      return res.send(twiml('Could not reach AI right now. Try again.'));
    }
  }

  // Log expense / income
  try {
    const parsed = await parseMessage(text);
    if (!parsed.amount || parsed.amount <= 0) throw new Error('no amount');
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('transactions').insert({
      user_id: process.env.VITE_USER_ID,
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      txn_date: today,
      payment_method: parsed.payment_method ?? 'bank',
      note: `via WhatsApp: "${text}"`,
    });
    if (error) throw error;
    const verb = parsed.type === 'income' ? '✅ Income logged' : '💸 Expense logged';
    return res.send(twiml(`${verb}\n\n*${parsed.description}*\n₹${parsed.amount} · ${parsed.category} · ${parsed.payment_method}`));
  } catch {
    return res.send(twiml(`Couldn't understand that.\n\nTry: *spent 200 on food*\nSend *help* for all commands.`));
  }
}