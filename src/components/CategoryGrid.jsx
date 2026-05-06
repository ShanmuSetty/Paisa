import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../lib/categories';
import { CategoryIcon } from '../lib/icons';

function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

export default function CategoryGrid({ txns, budgets, saveCategoryBudget, onCategoryClick }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft]     = useState('');

  const expenses = txns.filter(t => t.type === 'expense');
  const totals   = {};
  for (const t of expenses) {
    totals[t.category] = (totals[t.category] ?? 0) + Number(t.amount);
  }

  function startEdit(e, catId) {
    e.stopPropagation();
    setDraft(budgets[catId] ?? '');
    setEditing(catId);
  }

  async function submitBudget(e, catId) {
    e.preventDefault();
    e.stopPropagation();
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) await saveCategoryBudget(catId, val);
    setEditing(null);
  }

  return (
    <div style={styles.wrap}>
      <p style={styles.heading}>This month</p>
      <div style={styles.grid}>
        {EXPENSE_CATEGORIES.map(cat => {
          const spent  = totals[cat.id] ?? 0;
          const budget = budgets[cat.id] ?? 0;
          const pct    = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
          const over   = budget > 0 && spent > budget;
          const barColor = over ? '#F09595' : pct > 80 ? '#EF9F27' : cat.text + 'CC';

          return (
            <div
              key={cat.id}
              style={{ ...styles.tile, background: cat.fill, cursor: 'pointer' }}
              onClick={() => onCategoryClick(cat.id)}
            >
              <div style={styles.tileTop}>
                <CategoryIcon id={cat.id} color={cat.text} size={20} />
                <button
                  style={{ ...styles.budgetBtn, color: cat.text, borderColor: cat.text + '55' }}
                  onClick={e => startEdit(e, cat.id)}
                >
                  {budget > 0 ? fmt(budget) : '+ budget'}
                </button>
              </div>

              <p style={{ ...styles.catLabel, color: cat.text }}>{cat.label}</p>
              <p style={{ ...styles.catAmt, color: cat.text }}>{fmt(spent)}</p>

              {budget > 0 && (
                <div style={styles.miniTrack}>
                  <div style={{ ...styles.miniFill, width: pct + '%', background: barColor }} />
                </div>
              )}

              {over && (
                <p style={{ ...styles.overTag, color: cat.text }}>over by {fmt(spent - budget)}</p>
              )}

              {editing === cat.id && (
                <form onSubmit={e => submitBudget(e, cat.id)} style={styles.editForm} onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    style={{ ...styles.editInput, color: cat.text, borderColor: cat.text + '66' }}
                    type="number" placeholder="Budget ₹"
                    value={draft} onChange={e => setDraft(e.target.value)}
                  />
                  <button style={{ ...styles.saveBtn, background: cat.text, color: cat.fill }} type="submit">✓</button>
                  <button style={{ ...styles.cancelBtn, color: cat.text }} type="button" onClick={e => { e.stopPropagation(); setEditing(null); }}>✕</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: '20px 20px 0' },
  heading: { fontSize: '15px', fontWeight: '500', fontFamily: 'var(--font-display)', color: 'var(--brown-900)', marginBottom: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' },
  tile: { borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' },
  tileTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  budgetBtn: { background: 'none', border: '1px solid', borderRadius: '99px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  catLabel: { fontSize: '12px' },
  catAmt: { fontSize: '18px', fontWeight: '600', fontFamily: 'var(--font-display)' },
  miniTrack: { background: 'rgba(0,0,0,0.15)', borderRadius: '99px', height: '4px', marginTop: '4px', overflow: 'hidden' },
  miniFill: { height: '4px', borderRadius: '99px', transition: 'width 0.4s ease' },
  overTag: { fontSize: '11px', fontWeight: '500', marginTop: '2px' },
  editForm: { display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' },
  editInput: { flex: 1, background: 'rgba(255,255,255,0.5)', border: '1px solid', borderRadius: '8px', padding: '6px 8px', fontSize: '13px', outline: 'none', width: '0' },
  saveBtn: { border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', padding: '4px' },
};