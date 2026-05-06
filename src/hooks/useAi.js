import { useState } from 'react';
import { askGemini } from '../lib/gemini';
import { getCategoryMeta } from '../lib/categories';

function buildContext(txns, budgets) {
  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long' });
  const year = now.getFullYear();

  const expenses = txns.filter(t => t.type === 'expense');
  const income   = txns.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome  = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalBudget  = Object.values(budgets).reduce((s, v) => s + v, 0);

  const catTotals = {};
  for (const t of expenses) {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + Number(t.amount);
  }

  const catLines = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([id, spent]) => {
      const budget = budgets[id];
      const label  = getCategoryMeta(id).label;
      const budgetStr = budget ? ` / budget ₹${Math.round(budget)} (${Math.round((spent/budget)*100)}%)` : '';
      return `  - ${label}: ₹${Math.round(spent)}${budgetStr}`;
    })
    .join('\n');

  const recent = txns.slice(0, 10).map(t =>
    `  - ${t.txn_date} | ${t.type === 'income' ? '+' : '-'}₹${t.amount} | ${getCategoryMeta(t.category).label} | ${t.description}${t.note ? ` (${t.note})` : ''}`
  ).join('\n');

  return `You are a friendly, sharp personal finance assistant built into "paisa", a budget tracking app.
The user's currency is Indian Rupees (₹). Be concise, practical, and encouraging.
Never make up data — only use what's provided below.

=== ${monthName} ${year} Summary ===
Total income:  ₹${Math.round(totalIncome)}
Total spent:   ₹${Math.round(totalExpense)}
Total budget:  ${totalBudget ? '₹' + Math.round(totalBudget) : 'not set'}

=== Spending by category (with budgets) ===
${catLines || '  (no expenses yet)'}

=== Recent transactions ===
${recent || '  (none yet)'}`;
}

export function useAi(txns, budgets) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);

  async function sendMessage(text) {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    const context = buildContext(txns, budgets);
    const reply   = await askGemini(context, text);
    setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    setLoading(false);
  }

  function clearChat() { setMessages([]); }

  return { messages, loading, sendMessage, clearChat };
}