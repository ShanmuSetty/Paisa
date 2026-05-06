import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import { CategoryIcon, Icons } from '../lib/icons';
import { supabase } from '../lib/supabase';

export default function EditForm({ txn, onSave, onClose }) {
  const [desc, setDesc]     = useState(txn.description);
  const [amount, setAmount] = useState(String(txn.amount));
  const [cat, setCat]       = useState(txn.category);
  const [type, setType]     = useState(txn.type);
  const [date, setDate]     = useState(txn.txn_date);
  const [note, setNote]     = useState(txn.note ?? '');
  const [method, setMethod] = useState(txn.payment_method ?? 'bank');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!desc.trim()) return setErr('Add a description.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setErr('Enter a valid amount.');
    setSaving(true);
    const updates = {
      description: desc.trim(), amount: parseFloat(amount),
      type, category: cat, txn_date: date,
      note: note.trim() || null, payment_method: method,
    };
    const { data, error } = await supabase
      .from('transactions').update(updates).eq('id', txn.id).select().single();
    setSaving(false);
    if (error) return setErr(error.message);
    onSave(data);
    onClose();
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <div style={styles.titleRow}>
          <h2 style={styles.title}>Edit transaction</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={styles.toggle}>
          {['expense','income'].map(t => (
            <button key={t} type="button"
              style={{ ...styles.toggleBtn, ...(type === t ? styles.toggleActive : {}) }}
              onClick={() => { setType(t); setCat(t === 'expense' ? 'food' : 'salary'); }}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />

          <div style={styles.catGrid}>
            {categories.map(c => (
              <button key={c.id} type="button"
                style={{ ...styles.catBtn, background: cat === c.id ? c.fill : 'var(--bg-card)', color: cat === c.id ? c.text : 'var(--brown-700)', border: cat === c.id ? 'none' : '1px solid #E8DCC8' }}
                onClick={() => setCat(c.id)}>
                <CategoryIcon id={c.id} color={cat === c.id ? c.text : 'var(--brown-700)'} size={14} />
                {c.label}
              </button>
            ))}
          </div>

          <div style={styles.methodRow}>
            <span style={styles.methodLabel}>Pay via</span>
            <div style={styles.methodToggle}>
              {[['bank', Icons.bank], ['cash', Icons.cash]].map(([val, IconFn]) => (
                <button key={val} type="button"
                  style={{ ...styles.methodBtn, ...(method === val ? styles.methodActive : {}) }}
                  onClick={() => setMethod(val)}>
                  <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    {IconFn(method === val ? 'var(--brown-300)' : 'var(--brown-700)')}
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <input style={styles.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
          <textarea style={{ ...styles.input, resize: 'none', height: '68px' }} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />

          {err && <p style={styles.err}>{err}</p>}
          <button style={styles.saveBtn} type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(65,36,2,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 110 },
  sheet: { background: 'var(--bg)', borderRadius: '24px 24px 0 0', padding: '16px 20px 40px', width: '100%', maxHeight: '92vh', overflowY: 'auto' },
  handle: { width: '40px', height: '4px', background: 'var(--brown-300)', borderRadius: '99px', margin: '0 auto 16px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600', color: 'var(--brown-900)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown-700)', display: 'flex' },
  toggle: { display: 'flex', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '16px', gap: '4px' },
  toggleBtn: { flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '14px', textTransform: 'capitalize', color: 'var(--brown-500)', background: 'none', cursor: 'pointer' },
  toggleActive: { background: 'var(--brown-900)', color: 'var(--brown-300)', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { background: 'var(--bg-card)', border: '1px solid #E8DCC8', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '15px', color: 'var(--brown-900)', outline: 'none', width: '100%' },
  catGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  catBtn: { borderRadius: '99px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' },
  methodRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  methodLabel: { fontSize: '13px', color: 'var(--brown-700)', flexShrink: 0 },
  methodToggle: { display: 'flex', background: 'var(--bg-card)', border: '1px solid #E8DCC8', borderRadius: '99px', padding: '3px', gap: '4px', flex: 1 },
  methodBtn: { flex: 1, padding: '6px 10px', border: 'none', borderRadius: '99px', fontSize: '13px', color: 'var(--brown-700)', background: 'none', cursor: 'pointer' },
  methodActive: { background: 'var(--brown-900)', color: 'var(--brown-300)', fontWeight: '500' },
  err: { fontSize: '13px', color: '#A32D2D' },
  saveBtn: { background: 'var(--brown-900)', color: 'var(--brown-300)', border: 'none', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '16px', fontWeight: '500', fontFamily: 'var(--font-display)', cursor: 'pointer', marginTop: '4px' },
};