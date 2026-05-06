const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const HELP = `paisa bot 💰

*spent 250 on food* — log expense
*got 45000 salary* — log income
*spent 100 cash on transport* — cash payment
*balance* — this month summary
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
  const txns   = data ?? [];
  const income  = txns.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
  const cats = {};
  for (const t of txns.filter(t => t.type === 'expense'))
    cats[t.category] = (cats[t.category] ?? 0) + Number(t.amount);
  const topCats = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,3)
    .map(([k,v]) => `  ${k}: ₹${Math.round(v)}`).join('\n');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `*${months[now.getMonth()]} summary*\n\nIncome: ₹${Math.round(income)}\nSpent:  ₹${Math.round(expense)}\nSaved:  ₹${Math.round(income-expense)}\n\nTop spending:\n${topCats || '  (none yet)'}`;
}

function twiml(msg) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`;
}

module.exports = async function handler(req, res) {
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
    try { return res.send(twiml(await getMonthSummary())); }
    catch { return res.send(twiml('Could not fetch balance. Try again.')); }
  }

  try {
    const parsed = await parseMessage(text);
    if (!parsed.amount || parsed.amount <= 0) throw new Error('no amount');
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
    const verb = parsed.type === 'income' ? '✅ Income logged' : '💸 Expense logged';
    return res.send(twiml(`${verb}\n\n*${parsed.description}*\n₹${parsed.amount} · ${parsed.category} · ${parsed.payment_method}`));
  } catch {
    return res.send(twiml(`Couldn't understand that.\n\nTry: *spent 200 on food*\nSend *help* for all commands.`));
  }
};