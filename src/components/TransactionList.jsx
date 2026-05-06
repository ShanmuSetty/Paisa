import { useState } from 'react';
import { getCategoryMeta } from '../lib/categories';
import { CategoryIcon } from '../lib/icons';
import EditForm from './EditForm';

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

export default function TransactionList({ txns, deleteTxn, updateTxn, loading, searchQuery, filterType, filterCategory }) {
  const [editing, setEditing] = useState(null);

  let filtered = txns;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.description.toLowerCase().includes(q) ||
      (t.note && t.note.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
    );
  }
  if (filterType && filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
  if (filterCategory && filterCategory !== 'all') filtered = filtered.filter(t => t.category === filterCategory);

  if (loading) return <p style={styles.empty}>Loading...</p>;
  if (!filtered.length) return <p style={styles.empty}>{txns.length ? 'No matches.' : 'No transactions yet. Add one!'}</p>;

  return (
    <div style={styles.wrap}>
      <div style={styles.list}>
        {filtered.map(t => {
          const cat = getCategoryMeta(t.category);
          const isIncome = t.type === 'income';
          return (
            <div key={t.id} style={styles.row}>
              <div style={{ ...styles.iconBox, background: cat.fill }}>
                <CategoryIcon id={cat.id} color={cat.text} size={18} />
              </div>
              <div style={styles.info} onClick={() => setEditing(t)}>
                <p style={styles.desc}>{t.description}</p>
                {t.note && <p style={styles.note}>{t.note}</p>}
                <p style={styles.meta}>
                  {cat.label} · {fmtDate(t.txn_date)}
                  {t.payment_method === 'cash' && <span style={styles.cashBadge}>cash</span>}
                </p>
              </div>
              <div style={styles.right}>
                <p style={{ ...styles.amt, color: isIncome ? '#3B6D11' : 'var(--brown-900)' }}>
                  {isIncome ? '+' : '−'}{fmt(t.amount)}
                </p>
                <div style={styles.actions}>
                  <button style={styles.editBtn} onClick={() => setEditing(t)}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M9 2L11 4L4 11H2V9L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                  <button style={styles.del} onClick={() => deleteTxn(t.id)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {editing && <EditForm txn={editing} onSave={updateTxn} onClose={() => setEditing(null)} />}
    </div>
  );
}

const styles = {
  wrap: { padding: '4px 20px 100px' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '12px' },
  iconBox: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1, minWidth: 0, cursor: 'pointer' },
  desc: { fontSize: '14px', fontWeight: '500', color: 'var(--brown-900)', marginBottom: '2px' },
  note: { fontSize: '12px', color: 'var(--brown-500)', marginBottom: '2px', fontStyle: 'italic' },
  meta: { fontSize: '12px', color: 'var(--brown-700)', display: 'flex', alignItems: 'center', gap: '6px' },
  cashBadge: { background: '#FAC775', color: '#412402', fontSize: '10px', padding: '1px 6px', borderRadius: '99px', fontWeight: '500' },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 },
  amt: { fontSize: '15px', fontWeight: '600', fontFamily: 'var(--font-display)' },
  actions: { display: 'flex', gap: '6px', alignItems: 'center' },
  editBtn: { background: 'none', border: 'none', color: '#B4B2A9', cursor: 'pointer', padding: '0', lineHeight: 1 },
  del: { background: 'none', border: 'none', color: '#B4B2A9', cursor: 'pointer', padding: '0', lineHeight: 1 },
  empty: { textAlign: 'center', color: 'var(--brown-500)', fontSize: '14px', padding: '40px 20px' },
};