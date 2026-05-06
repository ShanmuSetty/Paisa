import { useState } from 'react';

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

export default function DebtsPanel({ debts, addDebt, settleDebt, deleteDebt, addTxn, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [person, setPerson]     = useState('');
  const [amount, setAmount]     = useState('');
  const [direction, setDirection] = useState('they_owe');
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);

  const iOwe    = debts.filter(d => d.direction === 'i_owe');
  const theyOwe = debts.filter(d => d.direction === 'they_owe');

  async function handleAdd(e) {
    e.preventDefault();
    if (!person.trim() || !amount || isNaN(amount)) return;
    setSaving(true);
    await addDebt({ person: person.trim(), amount: parseFloat(amount), direction, note: note.trim() || null });
    setSaving(false);
    setPerson(''); setAmount(''); setNote('');
    setShowForm(false);
  }

  async function handleSettle(debt) {
    await settleDebt(debt, addTxn);
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <div style={styles.header}>
          <span style={styles.title}>💸 Debts</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={styles.addBtn} onClick={() => setShowForm(f => !f)}>
              {showForm ? 'Cancel' : '+ Add'}
            </button>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={styles.scroll}>
          {/* add form */}
          {showForm && (
            <form onSubmit={handleAdd} style={styles.form}>
              <div style={styles.dirToggle}>
                {[['they_owe','They owe me'],['i_owe','I owe them']].map(([val, label]) => (
                  <button
                    key={val} type="button"
                    style={{ ...styles.dirBtn, ...(direction === val ? styles.dirActive : {}) }}
                    onClick={() => setDirection(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input style={styles.input} placeholder="Person's name" value={person} onChange={e => setPerson(e.target.value)} required />
              <input style={styles.input} type="number" placeholder="Amount ₹" value={amount} onChange={e => setAmount(e.target.value)} required />
              <input style={styles.input} placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
              <button style={styles.saveBtn} type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save debt'}</button>
            </form>
          )}

          {/* they owe me */}
          {theyOwe.length > 0 && (
            <div style={styles.section}>
              <p style={styles.sectionTitle}>They owe me 💰</p>
              {theyOwe.map(d => (
                <DebtRow key={d.id} debt={d} onSettle={() => handleSettle(d)} onDelete={() => deleteDebt(d.id)} color="#C0DD97" textColor="#173404" />
              ))}
            </div>
          )}

          {/* i owe */}
          {iOwe.length > 0 && (
            <div style={styles.section}>
              <p style={styles.sectionTitle}>I owe 😬</p>
              {iOwe.map(d => (
                <DebtRow key={d.id} debt={d} onSettle={() => handleSettle(d)} onDelete={() => deleteDebt(d.id)} color="#F5C4B3" textColor="#4A1B0C" />
              ))}
            </div>
          )}

          {debts.length === 0 && !showForm && (
            <p style={styles.empty}>No active debts. Tap + Add to log one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DebtRow({ debt, onSettle, onDelete, color, textColor }) {
  return (
    <div style={{ ...styles.debtRow, background: color }}>
      <div style={styles.debtLeft}>
        <p style={{ ...styles.debtPerson, color: textColor }}>{debt.person}</p>
        {debt.note && <p style={{ ...styles.debtNote, color: textColor }}>{debt.note}</p>}
      </div>
      <p style={{ ...styles.debtAmt, color: textColor }}>₹{Number(debt.amount).toLocaleString('en-IN')}</p>
      <div style={styles.debtActions}>
        <button style={{ ...styles.settleBtn, color: textColor, borderColor: textColor + '66' }} onClick={onSettle}>Settle</button>
        <button style={{ ...styles.delBtn, color: textColor }} onClick={onDelete}>✕</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(65,36,2,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: 'var(--bg)', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' },
  handle: { width: '40px', height: '4px', background: 'var(--brown-300)', borderRadius: '99px', margin: '14px auto 0', flexShrink: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px', flexShrink: 0 },
  title: { fontSize: '18px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--brown-900)' },
  addBtn: { background: 'var(--brown-900)', color: 'var(--brown-300)', border: 'none', borderRadius: '99px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--brown-700)' },
  scroll: { flex: 1, overflowY: 'auto', padding: '0 16px 40px' },
  form: { background: 'var(--bg-card)', border: '1px solid #E8DCC8', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  dirToggle: { display: 'flex', background: '#E8DCC8', borderRadius: '99px', padding: '3px', gap: '4px' },
  dirBtn: { flex: 1, padding: '7px', border: 'none', borderRadius: '99px', fontSize: '13px', color: 'var(--brown-700)', background: 'none', cursor: 'pointer' },
  dirActive: { background: 'var(--brown-900)', color: 'var(--brown-300)', fontWeight: '500' },
  input: { background: 'var(--bg)', border: '1px solid #E8DCC8', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '14px', color: 'var(--brown-900)', outline: 'none' },
  saveBtn: { background: 'var(--brown-900)', color: 'var(--brown-300)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  section: { marginBottom: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '500', color: 'var(--brown-700)', marginBottom: '8px' },
  debtRow: { borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  debtLeft: { flex: 1, minWidth: 0 },
  debtPerson: { fontSize: '14px', fontWeight: '500' },
  debtNote: { fontSize: '12px', marginTop: '2px', opacity: 0.8 },
  debtAmt: { fontSize: '16px', fontWeight: '600', fontFamily: 'var(--font-display)', flexShrink: 0 },
  debtActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  settleBtn: { background: 'none', border: '1px solid', borderRadius: '99px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' },
  delBtn: { background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', opacity: 0.6 },
  empty: { textAlign: 'center', color: 'var(--brown-500)', fontSize: '14px', padding: '40px 0' },
};